import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react'

import theme from '../theme'

import { createClient, dedupExchange, fetchExchange, Provider } from 'urql';
import { cacheExchange, QueryInput,Cache, query } from '@urql/exchange-graphcache';
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';


function typedUpdatedQuery<Result,Query>(

  cache:Cache,
  qi:QueryInput,
  result:any,
  fn:(r:Result,q:Query) => Query

  )
  
{
  return cache.updateQuery(qi,data => fn(result,data as any) as any)
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
