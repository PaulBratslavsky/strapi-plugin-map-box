import React from 'react';
import styled from 'styled-components';

const ControlsContainer = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1;
  width: 300px;
`;

const ControlsWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #dcdce4;
  border-radius: 4px;
  font-size: 14px;
`;

const SearchButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #4945ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #3832e0;
  }
`;

interface MapSearchProps {
  onSearch: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

export const MapSearch: React.FC<MapSearchProps> = ({
  onSearch,
  searchQuery,
  setSearchQuery,
  handleKeyDown
}) => {
  return (
    <ControlsContainer>
      <ControlsWrapper>
        <SearchInput
          type="text"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a location..."
        />
        <SearchButton
          type="button"
          onClick={onSearch}
        >
          Search
        </SearchButton>
      </ControlsWrapper>
    </ControlsContainer>
  );
};