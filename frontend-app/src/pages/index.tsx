import { withUrqlClient } from "next-urql";
import Layout from "../components/layout";
import { usePostsQuery } from "../generated/graphql";
import { CreateUrqlClient } from "../util/createUrqlClient";
import {
  Stack,
  Box,
  Text,
  Heading,
  Button,
  Flex,
  Link,
} from "@chakra-ui/react";
import React, { useState } from "react";
import VoteSection from "../components/voteSection";
import NextLink from "next/link";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!data && !fetching) {
    return <Heading>Not able to get data from the Server</Heading>;
  }

  return (
    <Layout variant="regular">
      <Heading p="10">LittleReddit</Heading>

      <Stack>
        {!data
          ? null
          : data.posts.Posts.map((p) => (
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <VoteSection points={p.points} postId={p.id} />
                <Box>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="xl">{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text mt={4}>{p.textSnipped}</Text>
                  <Text>Created By : {p.creator.username}</Text>
                </Box>
              </Flex>
            ))}
      </Stack>
      <Flex justifyContent="center" marginTop="10" padding={10}>
        {!data || !data!.posts.hasMore ? null : (
          <Button
            onClick={() =>
              setVariables({
                limit: variables.limit,
                cursor: data!.posts.Posts[data!.posts.Posts.length - 1]
                  .createdAt,
              })
            }
            color="black"
            loadingText="Loading Posts"
            colorScheme="teal"
            variant="outline"
          >
            More Posts
          </Button>
        )}
      </Flex>
    </Layout>
  );
};

export default withUrqlClient(CreateUrqlClient, { ssr: true })(Index);
