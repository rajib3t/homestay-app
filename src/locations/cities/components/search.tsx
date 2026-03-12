import * as React from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type SortOption = { label: string; value: string }

interface FilterPayload {
  search_field?: string
  search_value?: string
}

interface Props {
  onSearch?: (filter?: FilterPayload) => void
  onSortChange?: (sort: string) => void
  initialField?: string
  initialValue?: string
  initialSort?: string
  sortOptions?: SortOption[]
}

export default function CitiesSearch({
  onSearch,
  onSortChange,
  initialField = "name",
  initialValue = "",
  initialSort = "name:asc",
  sortOptions = [
    { label: "Name (A–Z)", value: "name:asc" },
    { label: "Name (Z–A)", value: "name:desc" },
    { label: "Country (A–Z)", value: "country:asc" },
    { label: "Country (Z–A)", value: "country:desc" },
    { label: "Created (new)", value: "createdAt:desc" },
    { label: "Created (old)", value: "createdAt:asc" },
  ],
}: Props) {
  const [field, setField] = React.useState<string | undefined>(initialField)
  const [value, setValue] = React.useState<string>(initialValue)
  const [sort, setSort] = React.useState(initialSort)

  React.useEffect(() => {
    setField(initialField)
  }, [initialField])

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  React.useEffect(() => {
    setSort(initialSort)
  }, [initialSort])

  function submit(e?: React.FormEvent) {
    e?.preventDefault()
    if (value) {
      onSearch?.({ search_field: field, search_value: value })
    } else {
      onSearch?.(undefined)
    }
  }

  function handleSortChange(value: string) {
    setSort(value)
    onSortChange?.(value)
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full items-center gap-2"
      role="search"
    >
      <div className="flex gap-2 flex-1">
        <Select value={field} onValueChange={(v) => setField(String(v))}>
          <SelectTrigger size="sm" className="min-w-[10rem]">
            <SelectValue placeholder="Field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="country">Country</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search by value..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Search cities by field"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger size="sm" className="min-w-[10rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          className="cursor-pointer"
          type="button"
          variant="ghost"
          onClick={() => {
            setField(initialField)
            setValue("")
            onSearch?.(undefined)
          }}
          aria-label="Reset search"
        >
          Reset
        </Button>

        <Button size="sm" type="submit">
          Search
        </Button>
      </div>
    </form>
  )
}
