"use client";

import NextLink from "next/link";

// <Link to="/path"> keeps the prototype's prop API on top of next/link.
export function Link({ to, children, ...rest }) {
  return (
    <NextLink href={to} {...rest}>
      {children}
    </NextLink>
  );
}