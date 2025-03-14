"use client";

import { useState } from "react";
import { Paper, InputBase, IconButton } from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";

type SearchBarProps = {
    setSearchTerm: (term: string) => void;
};

export default function SearchBar({ setSearchTerm }: SearchBarProps) {
    const [inputValue, setInputValue] = useState("");

    const handleSearch = () => {
        setSearchTerm(inputValue);
    };

    const handleClear = () => {
        setInputValue("");
        setSearchTerm("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <Paper
            component="div"
            sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                mb: 3
            }}
        >
            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Tìm kiếm địa điểm..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                fullWidth
            />
            {inputValue && (
                <IconButton 
                    type="button" 
                    sx={{ p: '10px' }} 
                    aria-label="clear"
                    onClick={handleClear}
                >
                    <ClearIcon />
                </IconButton>
            )}
            <IconButton 
                type="button" 
                sx={{ p: '10px' }} 
                aria-label="search"
                onClick={handleSearch}
            >
                <SearchIcon />
            </IconButton>
        </Paper>
    );
}