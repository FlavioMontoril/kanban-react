"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field } from "../ui/field";
import { Calendar } from "../ui/calendar";

interface IDateTasksWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export function DateTasksWithRange({
  date,
  setDate,
}: IDateTasksWithRangeProps) {
  const handleClearDate = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Impede de abrir/fechar o popover ao clicar no X
    setDate(undefined);
  };
  return (
    <Field className="mx-auto w-60">
      {/* <FieldLabel htmlFor="date-picker-range">Date Picker Range</FieldLabel> */}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              id="date-picker-range"
              className="justify-start px-2.5 font-normal"
            >
              <CalendarIcon data-icon="inline-start" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span className="text-xs">Selecione uma ou mais datas</span>
              )}
              {date?.from && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClearDate}
                  className="p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Limpar data"
                >
                  <X className="size-3.5" />
                </span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
