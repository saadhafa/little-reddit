import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react'

import theme from '../theme'

import { createClient, dedupExchange, fetchExchange, Provider } from 'urql';
import { cacheExchange, QueryInput,Cache } from '@urql/exchange-graphcache';
import { LoginMutation, MeDocument, MeQuery } from '../generated/graphql';


function typedUpdatedQuery<Result,Query>(Cache:Cache,qi:QueryInput,result:any,fn:(R:Result,q:Query) => Query){
  return Cache.updateQuery(qi,data => fn(result,data as any) as any)
}


function MyApp({ Component, pageProps }:any){
  const client = createClient({
    url: 'http://localhost:3333/graphql',
    fetchOptions:{
      credentials:"include"
    },
    exchanges: [dedupExchange, cacheExchange({
      updates:{
        Mutation:{
          login:(result:LoginMutation,args,cache,info) => {
            typedUpdatedQuery<LoginMutation,MeQuery>(cache,{query:MeDocument},result,(result,query) =>{
              if(result.login.user){
                return query
              }else{
                return {
                  me:result.login.user
                }
              }
            })
          }
        }
      }
    }), fetchExchange],
  });
  return (

    <Provider value={client}>
    <ChakraProvider resetCSS theme={theme}>
      <ColorModeProvider
        options={{
          useSystemColorMode: true,
        }}
      >
        <Component {...pageProps} />
      </ColorModeProvider>
    </ChakraProvider>
    </Provider>
  )
}

export default MyApp
