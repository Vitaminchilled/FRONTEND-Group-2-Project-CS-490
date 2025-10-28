import './MenuBox.css';

function MenuBox({ title, children, showView = true, showVerify = true, showReject = true }) {

  return (
    <div className="MenuBox">
      <div className="MenuBoxHeader">
        <h2>{title}</h2>
        <hr />
      </div>

      <div className="MenuBoxBody">
        {children}
      </div>

      {(showView || showVerify || showReject) && (
        <div className="MenuBoxFooter">
          {showView && <button className="view">View</button>}
          {showVerify && <button className="verify">Verify</button>}
          {showReject && <button className="reject">Reject</button>}
        </div>
      )}
    </div>
  );
}

export default MenuBox;
