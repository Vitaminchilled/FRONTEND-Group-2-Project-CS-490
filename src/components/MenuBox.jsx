import { useState, useEffect } from 'react';
import {ModalView, ModalVerify, ModalReject, ModalDelete} from './Modal.jsx';
import './MenuBox.css';

function MenuBox({ title, children, data, showView = true, showVerify = true, showReject = true, showDelete = false, onDataChange}) {

  const [isModalOpen, setModalOpen] = useState(false);
  const toggleOpen = (type) => {
    setModalOpen(prev => (prev === type ? null : type));
  }

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);
    
  return (
    <div className="MenuBox">
      <div className="MenuBoxHeader">
        <h2>{title}</h2>
        <hr />
      </div>

      <div className="MenuBoxBody">
        {children}
      </div>

      {(showView || showVerify || showReject || showDelete) && (
        <div className="MenuBoxFooter">
          {showView   && <button className="view"   onClick={() => toggleOpen('view')}  >View</button>}
          {showVerify && <button className="verify" onClick={() => toggleOpen('verify')}>Verify</button>}
          {showReject && <button className="reject" onClick={() => toggleOpen('reject')}>Reject</button>}
          {showDelete && <button className="delete" onClick={() => toggleOpen('delete')}>Delete</button>}
        </div>
      )}

      {isModalOpen === 'view'   && <ModalView   setModalOpen={() => setModalOpen(null)} salon={data}/>}
      {isModalOpen === 'verify' && <ModalVerify setModalOpen={() => setModalOpen(null)} salon={data} verifyChange={onDataChange}/>}
      {isModalOpen === 'reject' && <ModalReject setModalOpen={() => setModalOpen(null)} salon={data} verifyChange={onDataChange}/>}
      {isModalOpen === 'delete' && <ModalDelete setModalOpen={() => setModalOpen(null)} user ={data} verifyDelete={onDataChange}/>}
    </div>
  );
}

export default MenuBox;
