import styled from 'styled-components';

const TaskbarButton = styled.button`
  background-color: inherit;
  background-image: none;
  border: 0;
  cursor: pointer;
  display: inline-block;
  font-weight: normal;
  line-height: 0;
  margin: 4px;
  opacity: 0.6;
  padding: 2px 5px;
  text-align: center;
  touch-action: manipulation;
  user-select: none;
  white-space: nowrap;

  &:hover {
    opacity: 0.8;
  }

  &[disabled] {
    opacity: 0.3;
    cursor: not-allowed;
  }
  &[disabled]:hover {
    background-color: inherit;
  }

  &:hover {
    background-color: #e6e6e6;
    text-decoration: none;
  }

  &:focus,
  &:active {
    outline: 0;
  }
`;

export default TaskbarButton;
