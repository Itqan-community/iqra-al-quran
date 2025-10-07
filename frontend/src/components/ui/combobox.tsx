"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ComboboxProps = {
  items: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  emptyMessage: string
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder,
  emptyMessage,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[90vw] justify-between sm:w-[300px]"
        >
          <span className="rtl:order-2">
            {value
              ? items.find((item) => item.value === value)?.label
              : placeholder}
          </span>
          <ChevronsUpDown className="mx-2 h-4 w-4 shrink-0 opacity-50 rtl:order-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[90vw] p-0 sm:w-[300px]">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mx-2 h-4 w-4 rtl:order-2",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="rtl:order-1">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
