import { withUrqlClient } from "next-urql";
import Layout from "../components/layout";
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
} from "../generated/graphql";
import { CreateUrqlClient } from "../util/createUrqlClient";
import {
  Stack,
  Box,
  Text,
  Heading,
  Button,
  Flex,
  Link,
  IconButton,
} from "@chakra-ui/react";
import React, { useState } from "react";
import VoteSection from "../components/voteSection";
import NextLink from "next/link";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { isServer } from "../util/isServer";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });

  const [{ data: meData }] = useMeQuery({
    pause: isServer(),
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  const [, deletePost] = useDeletePostMutation();

  if (!data && !fetching) {
    return <Heading>Not able to get data from the Server</Heading>;
  }

  return (
    <Layout variant="regular">
      <Heading p="10">LittleReddit</Heading>

      <Stack>
        {!data
          ? null
          : data.posts.Posts.map((p) =>
              !p ? null : (
                <Flex
                  key={p.id}
                  p={5}
                  shadow="md"
                  borderWidth="1px"
                  justifyContent="space-around"
                  alignItems="center"
                >
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
                  <Box>
                    {meData?.me?.username !== p.creator.username ? null : (
                      <>
                        <IconButton
                          colorScheme="red"
                          aria-label="deletepost"
                          size="sm"
                          icon={<DeleteIcon />}
                          onClick={async () => {
                            await deletePost({ id: p.id });
                          }}
                          mr={4}
                        />
                        <NextLink
                          href="/post/edit/[id]"
                          as={`/post/edit/${p.id}`}
                        >
                          <IconButton
                            colorScheme="gray"
                            aria-label="editpost"
                            size="sm"
                            icon={<EditIcon />}
                          />
                        </NextLink>
                      </>
                    )}
                  </Box>
                </Flex>
              )
            )}
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
