import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, MapPin, Search } from "lucide-react";
import { JOB_CATEGORIES } from "../../lib/constants";

interface SearchFilterProps {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  location?: string;
  onLocationChange?: (v: string) => void;
  onReset?: () => void;
  compact?: boolean;
}

export default function SearchFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  location = "",
  onLocationChange,
  onReset,
  compact = false,
}: SearchFilterProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${compact ? "" : ""}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search jobs by title..."
          className="pl-9"
          data-ocid="jobs.search_input"
        />
      </div>

      {onLocationChange && (
        <div className="relative sm:w-44">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Location..."
            className="pl-9"
            data-ocid="jobs.location_input"
          />
        </div>
      )}

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="sm:w-40" data-ocid="jobs.category.select">
          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {JOB_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {onReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          data-ocid="jobs.filter.reset.button"
        >
          Reset
        </Button>
      )}
    </div>
  );
}
