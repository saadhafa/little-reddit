import { withUrqlClient } from "next-urql"
import Layout from "../components/layout"
import NavBar from "../components/NavBar"
import { usePostsQuery } from "../generated/graphql"
import { CreateUrqlClient } from "../util/createUrqlClient"

 
 
 
 const Index = () => {
     const [{data}] = usePostsQuery({
         variables:{
             limit:10 as never
         }
     })
    return (
        <Layout>

        <div>all Posts</div>
        {!data ? null : data.posts.map((post) => <div key={post.id}>{post.title}</div>)}
        </Layout>
    )



 }

 export default withUrqlClient(CreateUrqlClient,{ssr:true})(Index);