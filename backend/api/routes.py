from fastapi import APIRouter, BackgroundTasks, HTTPException
from sse_starlette.sse import EventSourceResponse
from schemas.models import DealInput, FinalReport
from orchestrator.workflow import generate_deal_brief_workflow
import uuid
import asyncio
import json

router = APIRouter()

# In-memory storage for deals
deals_db = {}
# In-memory queues for streaming progress
stream_queues = {}

async def run_workflow_and_stream(deal_id: str, deal_input: DealInput):
    queue = stream_queues.get(deal_id)
    if not queue:
        return
        
    try:
        async for event in generate_deal_brief_workflow(deal_input):
            await queue.put(event)
            
            # If complete, save to db
            if event["event"] == "complete":
                # The data is the JSON string of FinalReport
                original_input = deals_db[deal_id].get("input", {})
                deals_db[deal_id] = {"status": "complete", "report": json.loads(event["data"]), "input": original_input}
                
    except Exception as e:
        import traceback
        traceback.print_exc()
        await queue.put({"event": "error", "data": json.dumps({"message": f"An error occurred: {str(e)})"})})
        deals_db[deal_id] = {"status": "error", "message": str(e)}
    finally:
        await queue.put({"event": "close", "data": "{}"})

@router.post("/deals")
async def create_deal(deal_input: DealInput, background_tasks: BackgroundTasks):
    deal_id = str(uuid.uuid4())
    deals_db[deal_id] = {"status": "running", "input": deal_input.model_dump()}
    stream_queues[deal_id] = asyncio.Queue()
    
    # Start the workflow in the background
    background_tasks.add_task(run_workflow_and_stream, deal_id, deal_input)
    
    return {"id": deal_id}

@router.get("/deals/{deal_id}/stream")
async def stream_deal_progress(deal_id: str):
    if deal_id not in stream_queues:
        if deal_id in deals_db and deals_db[deal_id]["status"] == "complete":
            # Already completed, just return complete event
            async def event_generator():
                yield {"event": "complete", "data": json.dumps(deals_db[deal_id]["report"])}
                yield {"event": "close", "data": "{}"}
            return EventSourceResponse(event_generator())
        raise HTTPException(status_code=404, detail="Deal stream not found")
        
    queue = stream_queues[deal_id]

    async def event_generator():
        try:
            while True:
                # Wait for an event from the queue
                event = await queue.get()
                yield event
                queue.task_done()
                
                # If the event is close or complete, we can stop
                if event["event"] in ["close", "error"]:
                    break
        except asyncio.CancelledError:
            # Client disconnected
            pass
            
    return EventSourceResponse(event_generator())

@router.get("/deals/{deal_id}")
async def get_deal(deal_id: str):
    if deal_id not in deals_db:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deals_db[deal_id]
