const express = require('express')
const router = express.Router()
const {ListPosts} = require ('./blog-post-model')

router.get('/blog-posts', (req,res,next) => {
    ListPosts.get()
        .then(posts => {
            res.status(200).json({
                message: "Successfully sent all blog posts.",
                status: 200,
                posts: posts
            })
        }).catch(err => {
            res.status(500).json({
    			message : `Internal server error.`,
    			status : 500
    		})
            return next()
        })
})

router.get('/blog-posts/:author*?', (req,res,next) => {

    let author = req.params.author
    //406 IF AUTHOR MISSING IN PATH VARIABLES
    if (!(author)) {
        res.status(406).json({
            message: `Missing field author in params.`,
            status: 406
        })
        next()
    }

    ListPosts.getByAuthor(author)
        .then(posts => {
            if (posts === undefined || posts.length == 0) {
                res.status(404).json({
                    message: `Author '${author}' not found`,
                    status: 404
                })
                next()
            }
            res.status(200).json({
                message: `Successfully found blog posts for author ${author}`,
                status: 200,
                posts: posts
            })
        }).catch(err => {
            res.status(500).json({
                message : `Internal server error.`,
                status : 500
            })
            return next()
        })
})


router.post('/blog-posts', (req,res,next) => {

    let requiredFields = ["title", "content", "author", "publishDate"]
    for (rf of requiredFields) {
        if (!(rf in req.body)) {
            res.status(406).json({
                message: `Missing field '${rf}' in body`,
                status: 406
            })
        }
    }

    let newPost = {
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        publishDate: req.body.publishDate
    }

    ListPosts.post(newPost)
        .then(post => {
            res.status(201).json({
                message: `Successfully added the post.`,
                status: 201,
                postAdded: newPost
            })
        })
        .catch(err => {
            res.status(500).json({
                message: `Internal server error.`,
                status: 500,
            })
            return next()
        })
})



router.delete('/blog-posts/:id*?', (req,res,next) => {

    let id = req.params.id

    //406 IF ID MISSING IN PARAMS
    if (!(id)) {
        res.status(406).json({
            message: `Missing field id in params.`,
            status: 406
        })
        next()
    }

    if (!("id" in req.body)) {
        res.status(406).json({
            message: `Missing field id in body.`,
            status: 406
        })
        next()
    }

    if (id != req.body.id) {
        return res.status(409).json({
            message: `ID '${req.body.id}' in body different than ID '${req.params.id}' in params.`,
            status: 409
        })
        next()
    }

    ListPosts.delete(id)
        .then(post => {
            res.status(200).json({
                message: `Successfully deleted post with ID ${id}.`,
                status: 200,
                deleted: post
            }).send("Finish")
        })
        .catch(err => {
            res.status(404).json({
                message: `Post with id '${id}' not found in the list`,
                status: 404
            }).send("Finish")
        })

})

router.put('/blog-posts/:id*?', (req,res,next) => {

    //STATUS 406 IF ID MISSING IN PARAMS
    if (!(req.params.id)) {
        res.status(406).json({
            message: `Missing field id in params.`,
            status: 406
        })
    }

    let id = req.params.id

    if (req.body.length == 0) {
        res.status(404).json({
            message: `Empty body.`,
            status: 404
        })
        next()
    }

    var newPost = { }
    for (let key in req.body) {
        if (key == 'title') newPost.title = req.body[key]
        if (key == 'content') newPost.content = req.body[key]
        if (key == 'author') newPost.author = req.body[key]
        if (key == 'publishDate') newPost.publishDate = req.body[key]
    }

    if (newPost.title || newPost.content || newPost.author || newPost.publishDate) {
        updatedPost = ListPosts.put(id, newPost)
        if (updatedPost) {
            res.status(200).json({
                message: `Post with id '${id}' successfully updated.`,
                status: 200
            }).send("Finish")
        }
        else {
            res.status(404).json({
                message: `Post with id '${id}' not found in the list`,
                status: 404
            })
            next()
        }
    }
    else {
        return res.status(404).json({
            message: `Empty body.`,
            status: 404
        })
        next()
    }
})

module.exports = router
