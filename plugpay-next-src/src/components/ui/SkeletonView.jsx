"use client";

import { Sk } from "@/components/ui/Sk";

export function SkeletonView(props) {
  var kind = props.kind || "list",
    i;
  if (kind === "dash")
    return (
      <div className="sk-wrap" aria-busy="true" aria-label="Loading">
        <Sk w="40%" h={18} />
        <div
          style={{
            height: 10,
          }}
        />
        <div className="sk-card">
          <Sk w="30%" h={12} />
          <Sk
            w="60%"
            h={30}
            style={{
              margin: "10px 0",
            }}
          />
          <Sk w="100%" h={110} />
        </div>
        <div className="sk-card">
          {[0, 1, 2].map(function (n) {
            return (
              <div
                key={n}
                style={{
                  marginBottom: 12,
                }}
              >
                <Sk w="70%" h={12} />
                <Sk
                  w="100%"
                  h={8}
                  style={{
                    marginTop: 8,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  if (kind === "cards")
    return (
      <div className="sk-wrap" aria-busy="true">
        <div className="sk-grid">
          {[0, 1, 2, 3].map(function (n) {
            return (
              <div key={n} className="sk-card">
                <Sk w="100%" h={90} />
                <Sk
                  w="80%"
                  h={12}
                  style={{
                    marginTop: 10,
                  }}
                />
                <Sk w="50%" h={12} />
              </div>
            );
          })}
        </div>
      </div>
    );
  if (kind === "profile")
    return (
      <div aria-busy="true">
        <div className="sm-head">
          <div className="sm-top">
            <Sk
              w={62}
              h={62}
              cls="sk-circle"
              style={{
                background: "rgba(255,255,255,.35)",
              }}
            />
            <div
              style={{
                flex: 1,
              }}
            >
              <Sk
                w="70%"
                h={18}
                style={{
                  background: "rgba(255,255,255,.35)",
                }}
              />
              <Sk
                w="50%"
                h={12}
                style={{
                  background: "rgba(255,255,255,.35)",
                }}
              />
            </div>
          </div>
        </div>
        <div className="sm-body">
          <Sk w="100%" h={60} />
          <div
            style={{
              height: 14,
            }}
          />
          <div className="sk-row">
            {[0, 1, 2].map(function (n) {
              return <Sk key={n} w={110} h={110} />;
            })}
          </div>
          <div
            style={{
              height: 14,
            }}
          />
          <Sk w="100%" h={44} />
          <Sk
            w="100%"
            h={44}
            style={{
              marginTop: 8,
            }}
          />
        </div>
      </div>
    );
  return (
    <div className="sk-wrap" aria-busy="true" aria-label="Loading">
      {[0, 1, 2].map(function (n) {
        return (
          <div key={n} className="sk-card">
            <div className="sk-row">
              <Sk w={40} h={40} cls="sk-circle" />
              <div
                style={{
                  flex: 1,
                }}
              >
                <Sk w="60%" h={13} />
                <Sk w="40%" h={11} />
              </div>
              <Sk w={60} h={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
}