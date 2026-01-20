import React from 'react';
import styled from 'styled-components';

const ControlsContainer = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
  width: 350px;
`;

const SearchWrapper = styled.div`
  position: relative;
`;

const SearchInputContainer = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #dcdce4;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:focus-within {
    border-color: #4945ff;
    box-shadow: 0 0 0 2px rgba(73, 69, 255, 0.2);
  }
`;

const SearchIcon = styled.div`
  padding: 0 12px;
  color: #8e8e93;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 0;
  border: none;
  font-size: 14px;
  outline: none;
  background: transparent;

  &::placeholder {
    color: #8e8e93;
  }
`;

const ClearButton = styled.button`
  padding: 8px 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #8e8e93;
  display: flex;
  align-items: center;

  &:hover {
    color: #666;
  }
`;

const LoadingSpinner = styled.div`
  padding: 8px 12px;
  color: #4945ff;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  svg {
    animation: spin 1s linear infinite;
  }
`;

const ResultsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dcdce4;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
`;

const ResultItem = styled.button`
  width: 100%;
  padding: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: none;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f6f6f9;
  }
`;

const ResultIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: rgba(73, 69, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #4945ff;
`;

const ResultTextContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #32324d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultSubtitle = styled.div`
  font-size: 12px;
  color: #8e8e93;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
`;

const NoResults = styled.div`
  padding: 16px;
  text-align: center;
  color: #8e8e93;
  font-size: 14px;
`;

export interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
}

interface MapSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  onSelectResult: (result: SearchResult) => void;
  onClear: () => void;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
}

const getPlaceIcon = (placeType: string[]) => {
  if (placeType.includes('poi')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    );
  }
  if (placeType.includes('address')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    );
  }
  if (placeType.includes('place') || placeType.includes('locality')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
      </svg>
    );
  }
  if (placeType.includes('region') || placeType.includes('country')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
};

export const MapSearch: React.FC<MapSearchProps> = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  onSelectResult,
  onClear,
  showResults,
  setShowResults,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  const handleResultClick = (result: SearchResult) => {
    onSelectResult(result);
    setShowResults(false);
  };

  const handleClear = () => {
    onClear();
    setShowResults(false);
  };

  return (
    <ControlsContainer>
      <SearchWrapper>
        <SearchInputContainer>
          <SearchIcon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </SearchIcon>
          <SearchInput
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setShowResults(true)}
            placeholder="Search for a location..."
          />
          {isSearching && (
            <LoadingSpinner>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z" />
              </svg>
            </LoadingSpinner>
          )}
          {searchQuery && !isSearching && (
            <ClearButton onClick={handleClear} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </ClearButton>
          )}
        </SearchInputContainer>

        {showResults && searchQuery.length > 2 && (
          <ResultsDropdown>
            {searchResults.length > 0 ? (
              searchResults.map((result) => {
                const [title, ...rest] = result.place_name.split(',');
                const subtitle = rest.join(',').trim();
                return (
                  <ResultItem
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    type="button"
                  >
                    <ResultIcon>{getPlaceIcon(result.place_type)}</ResultIcon>
                    <ResultTextContainer>
                      <ResultTitle>{title}</ResultTitle>
                      {subtitle && <ResultSubtitle>{subtitle}</ResultSubtitle>}
                    </ResultTextContainer>
                  </ResultItem>
                );
              })
            ) : !isSearching ? (
              <NoResults>No results found</NoResults>
            ) : null}
          </ResultsDropdown>
        )}
      </SearchWrapper>
    </ControlsContainer>
  );
};
