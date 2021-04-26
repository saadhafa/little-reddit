import { withUrqlClient } from "next-urql"
import NavBar from "../components/NavBar"
import { usePostsQuery } from "../generated/graphql"
import { CreateUrqlClient } from "../util/createUrqlClient"

 
 
 
 const Index = () => {
     const [{data}] = usePostsQuery()
    return (
        <>
        <NavBar />
        <div>all Posts</div>
        {!data ? null : data.posts.map((post) => <div key={post.id}>{post.title}</div>)}
        </>
    )



 }

 export default withUrqlClient(CreateUrqlClient,{ssr:true})(Index);