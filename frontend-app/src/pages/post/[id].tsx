import { Box, Heading, Text } from "@chakra-ui/layout";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { FC } from "react";
import Layout from "../../components/layout";
import { usePostQuery, usePostsQuery } from "../../generated/graphql";
import { CreateUrqlClient } from "../../util/createUrqlClient";

interface PostProps {}

const Post: FC<PostProps> = ({}) => {
  const { query } = useRouter();

  const postId = typeof query.id === "string" ? parseInt(query.id) : -1;
  const [{ data, fetching }] = usePostQuery({
    pause: postId === -1,
    variables: {
      postId,
    },
  });

  if (fetching) {
    return (
      <Layout>
        <Heading>Loading data ... </Heading>
      </Layout>
    );
  }

  return (
    <Layout variant="regular">
      <Box>
        <Heading>{data?.post?.title}</Heading>
        <Text mt={4} whiteSpace="pre-wrap">
          {data?.post?.text}
        </Text>
        <Text textAlign="right" fontWeight="bold">
          Created By : {data?.post?.creator.username}
        </Text>
      </Box>
    </Layout>
  );
};

export default withUrqlClient(CreateUrqlClient, { ssr: true })(Post);
