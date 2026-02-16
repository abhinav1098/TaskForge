from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..database import get_db
from ..models import TaskDB, UserDB
from ..schemas import TaskCreate, TaskUpdate, TaskResponse
from ..dependencies.auth import get_current_user


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


# ==========================
# CREATE TASK
# ==========================

@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    db_task = TaskDB(
        title=task.title,
        priority=task.priority,
        completed=False,
        user_id=current_user.id,
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return db_task


# ==========================
# GET TASKS (Pagination + Filtering + Sorting)
# ==========================

@router.get(
    "",
    response_model=list[TaskResponse],
)
def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    completed: bool | None = None,
    sort_by_priority_desc: bool = True,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    query = db.query(TaskDB).filter(
        TaskDB.user_id == current_user.id
    )

    # Filtering
    if completed is not None:
        query = query.filter(TaskDB.completed == completed)

    # Sorting
    if sort_by_priority_desc:
        query = query.order_by(TaskDB.priority.desc())
    else:
        query = query.order_by(TaskDB.priority.asc())

    # Pagination
    tasks = query.offset(skip).limit(limit).all()

    return tasks


# ==========================
# GET SINGLE TASK
# ==========================

@router.get(
    "/{task_id}",
    response_model=TaskResponse,
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    db_task = db.query(TaskDB).filter(
        TaskDB.id == task_id,
        TaskDB.user_id == current_user.id,
    ).first()

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return db_task


# ==========================
# UPDATE TASK
# ==========================

@router.put(
    "/{task_id}",
    response_model=TaskResponse,
)
def update_task(
    task_id: int,
    task: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    db_task = db.query(TaskDB).filter(
        TaskDB.id == task_id,
        TaskDB.user_id == current_user.id,
    ).first()

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    update_data = task.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)

    return db_task


# ==========================
# DELETE TASK
# ==========================

@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    db_task = db.query(TaskDB).filter(
        TaskDB.id == task_id,
        TaskDB.user_id == current_user.id,
    ).first()

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    db.delete(db_task)
    db.commit()

    return None
