import styled from 'styled-components';

export const MapContainer = styled.div`
  height: 400px;
  width: 100%;
  margin-bottom: 1rem;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

export const ControlsContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
`;

export const ControlsWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

export const SearchInput = styled.input`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 250px;
  font-size: 14px;
`;

export const SearchButton = styled.button`
  padding: 8px 16px;
  background-color: #4945ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #3a36d9;
  }
`; 