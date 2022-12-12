const { AuthenticationError, UserInputError } = require('apollo-server')

const Post = require('../../models/Post')
const checkAuth = require('../../util/check-auth')



const postsResolvers = {
  Query: {
    getPosts: async () => {

      try {
        const posts = await Post.find().sort({ createdAt: -1 })
        return posts
      } catch (err) {
        throw new Error(err)
      }

    },
    getPost: async (_, { postId }) => {

      try {
        const post = await Post.findById(postId)

        if (post) return post
        
        throw new Error('Post not found')
        
      } catch (err) {
        throw new Error(err)
      }

    }
  },
  Mutation: {
    createPost: async (_, { body }, context) => {

      const user = checkAuth(context)

      if (body.trim() === '') throw new Error('Post body must not be empty')

      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: Date.now()
      })

      const post = await newPost.save()

      context.pubsub.publish('NEW_POST', {
        newPost: post
      })

      return post
    },
    deletePost: async (_, { postId }, context) => {

      const user = checkAuth(context)

      try {
        const post = await Post.findById(postId)

        if (user.username === post.username) {
          await post.delete()
          return 'Post deleted successfully'
        } else {
          throw new AuthenticationError('Action not allowed')
        }

      } catch (err) {
        throw new Error(err)
      }
    },
    likePost: async (_, { postId }, context) => {

      const { username } = checkAuth(context)

      const post = await Post.findById(postId)

      if(!post) throw new UserInputError('Post not found')

      
      if (post.likes.find((like) => like.username === username)) {

        // Post already likes, unlike it
        post.likes = post.likes.filter((like) => like.username !== username)

      } else {

        // Not liked, like post
        post.likes.push({
          username,
          createdAt: new Date().toISOString()
        })

      }

      await post.save()

      return post
    }
  }
}

module.exports = postsResolvers
