import { Box, Heading, Text } from "@chakra-ui/layout";
import { Button, Flex } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { FC } from "react";
import InputField from "../../../components/InputFiled";
import Layout from "../../../components/layout";
import {
  usePostQuery,
  usePostsQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { CreateUrqlClient } from "../../../util/createUrqlClient";

interface EditPostProps {}

const EditPost: FC<EditPostProps> = ({}) => {
  const { query, push } = useRouter();
  const postId = typeof query.id === "string" ? parseInt(query.id) : -1;
  const [{ data, fetching }] = usePostQuery({
    pause: postId === -1,
    variables: {
      postId,
    },
  });

  const [, updatePost] = useUpdatePostMutation();

  if (!data?.post && !fetching) {
    return (
      <Layout>
        <Heading>404 page not found</Heading>
      </Layout>
    );
  }

  if (fetching) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Formik
        initialValues={{ title: data?.post?.title, text: data?.post?.text }}
        onSubmit={async (values, { setErrors }) => {
          await updatePost({
            id: postId,
            title: values.title as string,
            text: values.text as string,
          });
          push("/");
        }}
      >
        {({}) => (
          <Form>
            <InputField name="title" label="title" placeholder="title" />
            <InputField
              textarea
              label="Post content"
              name="text"
              placeholder="Text content"
            />
            <Button mb={4} mt={5} type="submit" colorScheme="teal">
              Update Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(CreateUrqlClient)(EditPost);
