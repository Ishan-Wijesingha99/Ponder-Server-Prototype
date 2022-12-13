const { AuthenticationError, UserInputError } = require('apollo-server')

const checkAuth = require('../../util/check-auth')
const Post = require('../../models/Post')



const commentsResolvers = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {

      const { username } = checkAuth(context)

      if (body.trim() === '') throw new UserInputError('Empty comment', {
        errors: {
          body: 'Comment body must not empty'
        }
      })

      const post = await Post.findById(postId)

      if(!post) throw new UserInputError('Post not found')

      post.comments.unshift({
        body,
        username,
        createdAt: Date.now()
      })

      await post.save()

      return post
    },
    deleteComment: async (_, { postId, commentId }, context) => {

      const { username } = checkAuth(context)

      const post = await Post.findById(postId)

      if(!post) throw new UserInputError('Post not found')

      const commentIndex = post.comments.findIndex((c) => c.id === commentId)

      // only the creator of the comment can delete the comment, so check if the usernames match      
      if (post.comments[commentIndex].username === username) {
        post.comments.splice(commentIndex, 1)
        await post.save()
        return post
      } else {
        throw new AuthenticationError('Action not allowed')
      }
    }
  }
}

module.exports = commentsResolvers