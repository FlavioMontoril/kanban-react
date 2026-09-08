import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import type { UserResponse } from "@/types/user";

interface AssigneeSelectProps {
  value: string;
  users: UserResponse[];
  onChange: (userId: string) => void;
  disabled?: boolean;
}

export function AssigneeSelect({
  value,
  users,
  onChange,
  disabled,
}: AssigneeSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedUser = users.find((user) => user.id === value);

  const handleSelect = (currentValue: string) => {
    // Alterna a seleção: se clicar no mesmo, desmarca
    onChange(currentValue === value ? "" : currentValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between p-2.5 h-auto rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-normal text-slate-800 dark:text-slate-100"
        >
          {selectedUser ? selectedUser.name : "Nenhum responsável"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[240px] p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 z-50">
        <Command>
          <CommandInput placeholder="Buscar usuário..." className="h-9" />
          <CommandList>
            <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  /* Passe id como value único para evitar bugs de busca com nomes duplicados */
                  value={user.id}
                  /* O Command do cmdk filtra por 'value', use 'keywords' para buscar por nome */
                  keywords={[user.name]}
                  onSelect={handleSelect}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}