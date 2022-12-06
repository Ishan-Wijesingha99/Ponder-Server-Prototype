
const Post = require('../../models/Post')

const checkAuth = require('../../utils/checkAuth')

const { UserInputError, AuthenticationError } = require('apollo-server')

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {

      const user = checkAuth(context)

      if(body.trim() === '') throw new UserInputError('Empty comment', {
        errors: {
          body: 'Comment body must not be empty'
        }
      })

      const post = await Post.findById(postId)

      if(!post) throw new UserInputError('Post not found')

      post.comments.unshift({
        body,
        username: user.username,
        createdAt: Date.now()
      })

      await post.save()

      return post
    },
    deleteComment: async (_, { postId, commentId }, context) => {

      const user = checkAuth(context)

      const post = await Post.findById(postId)

      if(!post) throw new UserInputError('Post not found')

      const commentIndex = post.comments.findIndex(commentObject => commentObject.id === commentId)

      // only the creator of the comment can delete the comment, so check if the usernames match
      if(post.comments[commentIndex].username === user.username) {
        post.comments.splice(commentIndex, 1)

        await post.save()

        return post
      } else {
        throw new AuthenticationError('Action not allowed')
      }

    }
  }
}