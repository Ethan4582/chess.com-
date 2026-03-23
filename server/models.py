from pydantic import BaseModel
from typing import Optional, Dict

class MoveRequest(BaseModel):
    from_square: str
    to_square: str
    promotion: Optional[str] = "q"

class PlayerRoleResponse(BaseModel):
    role: str
