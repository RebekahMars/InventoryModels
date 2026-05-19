import React from 'react';
import ReactDOM from 'react-dom';
import FocusLock from 'react-focus-lock';
import styles from './Modal.module.css';

interface ModalProps {
  header: string;
  modalContent: React.ReactNode;
  closeModal?: () => void;
  height?: string;
}

const Modal = ({ header, modalContent, closeModal, height = '500px' }: ModalProps): React.ReactPortal => {
  return ReactDOM.createPortal(
    <div className={styles.backdrop} onClick={closeModal}>
      <FocusLock>
        <div className={styles.wrapper} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modal} style={{ height }}>
            <div className={styles.header}>
              <span className={styles.headerText}>{header}</span>
              {closeModal && (
                <button className={styles.closeButton} onClick={closeModal} aria-label="Close">
                  ×
                </button>
              )}
            </div>
            <div className={styles.content}>{modalContent}</div>
          </div>
        </div>
      </FocusLock>
    </div>,
    document.body,
  );
};

export default Modal;
