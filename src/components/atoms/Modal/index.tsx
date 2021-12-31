import React from "react";
import FocusLock from 'react-focus-lock';
import ReactDom from "react-dom";
import styled from 'styled-components';

export const Wrapper = styled.div`
	position: fixed;
	top: 40%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 700;
	width: 600px;
	outline: 0;
`;

export const Backdrop = styled.div`
	position: fixed;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	background: rgba(0, 0, 0, 0.3);
	z-index: 500;
`;

export const StyledModal = styled.div`
	z-index: 100;
	background: white;
	position: relative;
	margin: auto;
	height: 500px;
	border-radius: 5px;
`;

export const Header = styled.div`
	border-radius: 8px 8px 0 0;
	display: flex;
	justify-content: space-between;
	padding: 0.3rem;
`;

export const HeaderText = styled.div`
	color: #fff;
	align-self: center;
	color: darkgray;
`;

export const CloseButton = styled.button`
	font-size: 0.8rem;
	border: none;
	border-radius: 3px;
	margin-left: 0.5rem;
	background: none;
	:hover {
		cursor: pointer;
	}
`;

export const Content = styled.div`
	display: flex;
	flex-direction: column;
	padding: 10px;
	max-height: 30rem;
	overflow-x: hidden;
	overflow-y: auto;
`;


interface ModalProps {
  className?: string;
  closeModal?: ()=> void;
  modalContent: React.ReactNode;
  header: string;
}

const Modal = ({ className, closeModal, modalContent, header}: ModalProps): React.ReactPortal => {

  return ReactDom.createPortal(
    <Backdrop onClick={closeModal}>
      <FocusLock>
		  <Wrapper>
			  <StyledModal className={className}>
				  <Header>
					  <HeaderText>{header}</HeaderText>
				  </Header>
				  <Content>{modalContent}</Content>
			  </StyledModal>
		  </Wrapper>
      </FocusLock>  
    </Backdrop>,
	document.body
  );
};

export default Modal;