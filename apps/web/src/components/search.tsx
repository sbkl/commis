"use client";

import * as React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@commis/ui/components/input-group";
import { SearchIcon, X } from "lucide-react";
import { Button } from "@commis/ui/components/button";
import {
  parseAsString,
  SingleParserBuilder,
  useQueryStates,
  Values,
} from "nuqs";

interface QuerySearchContextProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  clearQuery: () => void;
  handleSearchQuery: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchQuery: string | null;
  optimisticSearchQuery: string | null;
}

interface QuerySearchProviderProps {
  children: React.ReactNode;
}

const QuerySearchContext = React.createContext<
  QuerySearchContextProps | undefined
>(undefined);

export type QueryStatesValues = Values<{
  query: SingleParserBuilder<string | null>;
}>;

export function QuerySearchProvider({ children }: QuerySearchProviderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout>();
  const [_isPending, startTransition] = React.useTransition();
  const [queryStateValues, setQueryStateValues] = useQueryStates(
    {
      query: parseAsString,
    },
    {
      history: "replace",
      startTransition,
      shallow: false,
      urlKeys: {
        query: "q",
      },
    }
  );

  const [optimisticSearchQuery, setOptimisticSearchQuery] = React.useOptimistic<
    QueryStatesValues,
    {
      query: string | null;
    }
  >(queryStateValues, (_currentState, update) => {
    return update;
  });

  function updateQuery(value: string | null) {
    startTransition(async () => {
      const update = {
        query: value === "" ? null : value,
      };
      setOptimisticSearchQuery(update);
      await setQueryStateValues(update);
    });
  }

  function handleSearchQuery(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    clearTimeout(timeoutId);
    const id = setTimeout(() => {
      updateQuery(e.target.value === "" ? null : e.target.value);
      setTimeoutId(undefined);
    }, 300);
    setTimeoutId(id);
  }

  function clearQuery() {
    updateQuery(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }
  return (
    <QuerySearchContext
      value={{
        inputRef,
        clearQuery,
        handleSearchQuery,
        searchQuery: queryStateValues.query ?? null,
        optimisticSearchQuery: optimisticSearchQuery.query ?? null,
      }}
    >
      {children}
    </QuerySearchContext>
  );
}

export function useQuerySearch() {
  const context = React.useContext(QuerySearchContext);
  if (!context) {
    throw new Error("useQuerySearch must be used within a QuerySearchProvider");
  }
  return context;
}

export function SearchInput() {
  const {
    inputRef,
    clearQuery,
    handleSearchQuery,
    searchQuery,
    optimisticSearchQuery,
  } = useQuerySearch();
  return (
    <InputGroup className="w-72">
      <InputGroupInput
        ref={inputRef}
        type="text"
        placeholder="Search"
        defaultValue={searchQuery ?? undefined}
        onChange={handleSearchQuery}
      />
      <InputGroupAddon>
        <SearchIcon className="size-4 text-muted-foreground" />
      </InputGroupAddon>
      {optimisticSearchQuery ? (
        <InputGroupAddon align="inline-end">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={clearQuery}
          >
            <X className="size-4 text-muted-foreground" />
          </Button>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}
