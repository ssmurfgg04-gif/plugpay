"use client";

export function DashSignIn(props) {
  return (
    <div className="app-card">
      <div className="app-card-title">Sign in required</div>
      <div className="app-card-sub">{props.msg}</div>
      <div className="app-actions">
        <button className="pp-btn primary" onClick={props.onClick}>
          Sign in
        </button>
      </div>
    </div>
  );
}