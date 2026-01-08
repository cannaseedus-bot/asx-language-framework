from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class LowerError(Exception):
    code: str
    msg: str

    def __str__(self) -> str:
        return f"{self.code}: {self.msg}"


def lower_ast_to_scene_xjson(ast: Dict[str, Any], grammar_abi: Dict[str, Any]) -> Dict[str, Any]:
    body = ast.get("body")
    if not isinstance(body, str):
        raise LowerError(code="E_LOWER_BODY", msg="missing GGL body for lowering")

    scene = {
        "@type": grammar_abi.get("lowered_type", "scene.ir.v1"),
        "ggl": body,
    }
    lowering_contract = grammar_abi.get("lowering_contract_id")
    if lowering_contract:
        scene["@lowering"] = lowering_contract
    return scene
