import styled from 'styled-components';
import { ViewState } from './types';


interface DebugInfoProps {
  searchResults: any;
  searchError: string | null;
  viewState: ViewState;
  markerPosition: { longitude: number; latitude: number };
  searchQuery: string;
  value?: any;
}

export function DebugInfo({ 
  searchResults, 
  searchError, 
  viewState,
  markerPosition,
  searchQuery,
  value 
}: DebugInfoProps) {
  return (
    <DebugContainer>
      <h4>Debug Information:</h4>
      
      <DebugSection>
        <strong>Search Results:</strong>
        <DebugPre>
          {searchResults ? JSON.stringify(searchResults, null, 2) : 'No search results yet'}
        </DebugPre>
      </DebugSection>

      {searchError && (
        <ErrorMessage>
          <strong>Error:</strong> {searchError}
        </ErrorMessage>
      )}

      <DebugSection>
        <strong>Current View State:</strong>
        <DebugPre>
          {JSON.stringify(viewState, null, 2)}
        </DebugPre>
      </DebugSection>

      <DebugSection>
        <strong>Marker Position:</strong>
        <DebugPre>
          {JSON.stringify(markerPosition, null, 2)}
        </DebugPre>
      </DebugSection>

      <DebugSection>
        <strong>Search Query:</strong>
        <DebugPre>
          {searchQuery || 'No search query'}
        </DebugPre>
      </DebugSection>

      <DebugSection>
        <strong>Current Value:</strong>
        <DebugPre>
          {value ? JSON.stringify(value, null, 2) : 'No value set'}
        </DebugPre>
      </DebugSection>
    </DebugContainer>
  );
}

const DebugContainer = styled.div`
  margin-top: 20px;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const DebugSection = styled.div`
  margin-bottom: 10px;
`;

const DebugPre = styled.pre`
  background: #ffffff;
  padding: 10px;
  border-radius: 4px;
  max-height: 200px;
  overflow: auto;
  margin: 5px 0;
  border: 1px solid #dcdce4;
`;

const ErrorMessage = styled.div`
  color: #d02b20;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #fff5f5;
  border: 1px solid #ffd7d5;
  border-radius: 4px;
`;