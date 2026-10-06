"use client";

export function Sk(props) {
  return (
    <div
      className={"sk " + (props.cls || "")}
      style={Object.assign(
        {
          width: props.w,
          height: props.h,
        },
        props.style || {},
      )}
    />
  );
}