import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"

interface DatePickerProps {
  value: Date | undefined,
  className?: string,
  id?: string,
  name?: string,
  text?: string,
  onChange: (date: Date | undefined) => void,
}

export function DatePicker({ value, className, id, name, text = "Selecione uma Data", onChange }: DatePickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (date: Date | undefined) => {
        onChange(date);
        setOpen(false);
    };

    // Garante que o valor seja um objeto Date válido ou undefined.
    const dateValue = value instanceof Date ? value : (value ? new Date(value) : undefined);
    const isValidDate = dateValue && !isNaN(dateValue.getTime());

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
            <Button
                variant="outline"
                id={id}
                name={name}
                className={`${className} justify-start text-left font-normal ${!isValidDate && "text-muted-foreground"}`}
            >
                {isValidDate ? dateValue.toLocaleDateString("pt-BR") : text}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
                mode="single"
                selected={isValidDate ? dateValue : undefined}
                captionLayout="dropdown"
                onSelect={handleSelect}
                fromYear={1900}
                toYear={new Date().getFullYear()}
            />
            </PopoverContent>
        </Popover>
    );
}