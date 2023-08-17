export const types = `#graphql

    input CreateTweetData{
        content:String!
        imageURL:String
    }

    type Tweet{
        id: Id!
        content:String!
        imageURL:String
        author:User
    }
`;
