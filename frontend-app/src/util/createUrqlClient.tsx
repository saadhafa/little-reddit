import { createClient, dedupExchange, fetchExchange } from "urql"
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from "../generated/graphql"
import { QueryInput,Cache,cacheExchange } from '@urql/exchange-graphcache'


function typedUpdatedQuery<Result,Query>(

    cache:Cache,
    qi:QueryInput,
    result:any,
    fn:(r:Result,q:Query) => Query
  
    )
    
  {
    return cache.updateQuery(qi,data => fn(result,data as any) as any)
  }




export const CreateUrqlClient = (ssrExchange:any) => ({

        url: 'http://localhost:3333/graphql',
        fetchOptions:{
          credentials:"include" as const
        },
        exchanges: [dedupExchange, cacheExchange({
          updates:{
            Mutation:{
              logout:(_result,args,cache,info) =>{
                typedUpdatedQuery<LogoutMutation, MeQuery>(cache,{query:MeDocument},_result,() => ({me:null}))
              },
              login:(_result,args,cache,info) =>{
                typedUpdatedQuery<LoginMutation,MeQuery>(cache,
                  {query:MeDocument},
                    _result,
                    (result,query) =>{
                      if(result.login.errors){
                        return query
                      }else{
                        return{
                          me: result.login.user
                        }
                      }
                    })
              },
              register:(_result,args,cache,info) =>{
                typedUpdatedQuery<RegisterMutation,MeQuery>(cache,
                  {query:MeDocument},
                    _result,
                    (result,query) =>{
                      if(result.register.errors){
                        return query
                      }else{
                        return{
                          me: result.register.user
                        }
                      }
                    })
              } 
            }
          }
        }), 
        ssrExchange,
        fetchExchange],
      })


