import { Box, Flex, Text } from "@chakra-ui/layout";
import { Link } from "@chakra-ui/react";
import React from "react";

import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../util/isServer";

const NavBar: React.FC = () => {
  const [{ data }] = useMeQuery({
    pause: isServer(),
  });
  const [, logout] = useLogoutMutation();

  let body = null;

  if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link ml={4} color="white">
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link ml={4} color="white">
            register
          </Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Box>
        <Text display="inline" ml={4} fontWeight="bolder" color="black">
          {data.me.username}
        </Text>
        <NextLink href="/create-post">
          <Link ml={4} color="white">
            Create Post
          </Link>
        </NextLink>
        <Link
          onClick={() => {
            logout();
          }}
          ml={5}
          color="white"
        >
          Logout
        </Link>
      </Box>
    );
  }

  return (
    <Flex
      position="sticky"
      zIndex={3}
      top="0"
      bg="tomato"
      justifyContent="flex-end"
    >
      <Box p={4}>{body}</Box>
    </Flex>
  );
};

export default NavBar;
