"use client";

import { Ellipsis, PencilIcon, SendToBack, TrashIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface ITaskDropdownMenu {
  onSelectAction: (action: "edit" | "delete" | "updateStatus") => void;
}

export function TaskDropdownMenu({ onSelectAction }: ITaskDropdownMenu) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="cursor-pointer hover:text-slate-600">
            <Ellipsis size={16} />
          </button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onSelectAction("edit")}>
            <PencilIcon />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={()=> onSelectAction("updateStatus")}>
            <SendToBack />
            Alterar status
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onSelectAction("delete")} variant="destructive">
            <TrashIcon />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
