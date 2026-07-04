import datetime

pipeline_status = {
    "last_run_time": None,
    "last_run_status": "Not run yet"
}

def set_pipeline_status(status: str):
    pipeline_status["last_run_time"] = datetime.datetime.now().isoformat()
    pipeline_status["last_run_status"] = status
