import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import * as React from "react";
import { useVoteMutation } from "../generated/graphql";

export interface IAppProps {
  points: number;
  postId: number;
}

const VoteSection: React.FC<IAppProps> = ({ points, postId }) => {
  const [, vote] = useVoteMutation();
  //   add loading after
  return (
    <Flex direction="column" mr={5} justifyContent="center" alignItems="center">
      <IconButton
        colorScheme="blue"
        aria-label="voteUp"
        size="sm"
        icon={<ChevronUpIcon />}
        onClick={async () => {
          await vote({ value: 1, postId });
        }}
      />
      {points}

      <IconButton
        colorScheme="red"
        aria-label="voteDown"
        size="sm"
        icon={<ChevronDownIcon />}
        onClick={async () => {
          await vote({ value: -1, postId });
        }}
      />
    </Flex>
  );
};

export default VoteSection;
