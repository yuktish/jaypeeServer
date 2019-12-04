const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
    .get(cors.cors, authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id})
        .populate('dishes')
        .populate('user')
        .then((favorites) => {
          if (favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites.dishes);
          } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
          }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        console.log(req);
        Favorites.findOne({user: req.user._id})
        .then((favorites) => {
            if(!favorites) {
                Favorites.create({})
                .then((favorites) => {
                    favorites.user = req.user._id;
                    favorites.dishes = req.body;
                    favorites.save()
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                    .catch(err => next(err));
                })
                .catch(err => next(err));
            }
            else {
                Favorites.create({})
                .then((favorites) => {
                console.log(favorites);
                for(var i = 0; i < req.body.length; i++) {
                    dishId = req.body[i]._id;
                    if(indexOf(favorites.dishes.dishId) === -1) {
                       favorites.dishes.push(dishId);
                    }
                    favorites.user = req.user._id;
                    favorites.save()
                    .catch(err => next(err));
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })}
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        Favorites.deleteMany()
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
    .get(cors.cors, authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id})
        .then((favorites) => {
            if(!favorites) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                if(favorites.dishes.indexOf(req.params.dishId) < 0) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists": false, "favorites": favorites});
                }
                else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists": true, "favorites": favorites});
                }
            }
        }, (err) => next(err))
        .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        console.log("  Favorites.findOne() req.user._id =", req.user._id);
        console.log("  Favorites.findOne() req.params.dishId =", req.params.dishId);
        Favorites.findOne({user: req.user._id})
        .then(favorites => {
  console.log(".then(favorites) favorites =", favorites);
            if(!favorites) {
                console.log("if(!favorites)");
                Favorites.create({user: req.user._id})
                .then((newFavorite) => {
                  console.log("create .then() req.user._id =", req.user._id);
                    newFavorite.user = req.user._id;
                    newFavorite.dishes.push({"_id":req.params.dishId});
                    newFavorite.save()
                    .then((savedFavorite) => {
                      console.log("saved .then()");
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(savedFavorite);
                    })
                    .catch(err => {
                      console.log("catch1");
                      next(err)
                    });
                })
                .catch(err => {
                  console.log("catch0");
                  next(err)
                });
            }
            else {
                console.log("else");
                if(favorites.dishes.indexOf(req.params.dishId) < 0) {
                    favorites.dishes.push({"_id": req.params.dishId});
                    favorites.save()
                    .then((savedFavorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(savedFavorite);
                    })
                    .catch((err) => {
                        return next(err);
                    });
                }
                else {
                    res.statusCode = 403;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('Dish ' + req.params.dishId + ' already included');
                }
            }
        }, (err) => next(err))


        /*
  //      Favorites.findOne({user: req.user._id}, (err, favorites) => {
          Favorites.findOne({user: req.user._id ,dishes: req.params.dishId}, (err, favorite) => {

          if(err) return next(err);
              if(!favorite) {
                  Favorites.create({})
                  .then((newFavorite) => {
                      newFavorite.user = req.user._id;
                      newFavorite.dishes.push({"_id":req.params.dishes});
                      newFavorite.save()
                      .then((savedFavorite) => {
                          res.statusCode = 200;
                          res.setHeader('Content-Type', 'application/json');
                          res.json(savedFavorite);
                      })
                      .catch(err => next(err));
                  })
                  .catch(err => next(err));
              }
              else {
                  if(favorite.dishes.indexOf(req.params.dishId) < 0) {
                      favorite.dishes.push({"_id": req.params.dishId});
                      favorite.save()
                      .then((savedFavorite) => {
                          res.statusCode = 200;
                          res.setHeader('Content-Type', 'application/json');
                          res.json(savedFavorite);
                      })
                      .catch((err) => {
                          return next(err);
                      });
                  }
                  else {
                      res.statusCode = 403;
                      res.setHeader('Content-Type', 'text/plain');
                      res.end('Dish ' + req.params.dishId + ' already included');
                  }
              }
          }, (err) => next(err))*/


        .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/' + req.params.dishId);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user:req.user._id}, (err, favorite) => {
            if(err) return next(err);

            var index = favorite.dishes.indexOf(req.params.dishId);
            if (index >= 0) {
                favorite.dishes.splice(index, 1);
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite.dishes);
                    })
                })
                .catch((err) => {
                    return next(err);
                })
            }
            else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Dish ' + req.params.dishId + ' is not in your favorites');
            }
        })
    });

module.exports = favoriteRouter;
