Websites = new Mongo.Collection("websites");

if (Meteor.isClient) {


    Router.configure({layoutTemplate: "ApplicationTemplate"});

    Router.route('/', function () {
        this.render('navbar', {
            to: "navbar"
        });
        this.render('showSites', {
            to: "main"
            //data: function () { return We.findOne({_id: this.params._id}); }
        });
    });

    Router.route('/website/:_id', function () {
        this.render('navbar', {
            to: "navbar"
        });
        this.render('showSite', {
            to: "main",
            data: function () {
                return Websites.findOne({_id: this.params._id});
            }
        });
    });

    /////
    // template helpers
    /////


    Template.showSite.helpers({
        isComment: function () {
            return (Session.get('isComment') == true) ? "has-success" : "has-error";
        }
    });

    Template.showSite.events({
        'change #comment': function (event) {
            var comment = event.currentTarget.value;
            Session.set('isComment', comment.length > 0);
        },
        "submit .js-save-comment-form": function (event) {
            var comment = event.target.comment.value;
            var user = Meteor.user();
            console.log("The websiteid is: " + this._id);
            console.log("user", user);
            console.log("The comment they entered is: " + comment);
            var name = "Anonymous";
            if (user.profile) {
                name = user.profile.name;
            }
            if (name == "Anonymous" && user.emails && user.emails[0]) {
                name = user.emails[0].address;
            }

            if (comment.length) {
                var commentObj = {
                    comment: comment,
                    userName: name
                };
                //  put your website saving code in here!
                var affected = Websites.update(
                    {
                        _id: this._id
                    },
                    {
                        $addToSet: {
                            comments: commentObj
                        }
                    });
                if (!affected) {
                    alert('You are not able to comment! You are not logged in.')
                }
                else {
                    event.target.comment.value = '';
                }
            } else {
                alert("You need to have a comment before submit!")
            }
            return false;// stop the form submit from reloading the page

        }
    });


    // helper function that returns all available websites
    Template.website_list.helpers({
        websites: function () {
            return Websites.find({}, {sort: {votes: -1}});
        }
    });

    Template.website_item.helpers({
        upvoteAllowClass: function () {
            var userId = Meteor.userId();
            if (userId && !_.include(this.upvoters, userId)) {
                return '';
            } else {
                return 'disabled';
            }
        },
        downvoteAllowClass: function () {
            var userId = Meteor.userId();
            if (userId && !_.include(this.downvoters, userId)) {
                return '';
            } else {
                return 'disabled';
            }
        }
    });
    Template.website_form.helpers({
        isUrl: function () {
            return (Session.get('isUrl') == true) ? "has-success" : "has-error";
        },
        isTitle: function () {
            return (Session.get('isTitle') == true) ? "has-success" : "has-error";
        },
        isDescription: function () {
            return (Session.get('isDescription') == true) ? "has-success" : "has-error";
        },
    })
    /////
    // template events
    /////

    Template.website_item.events({
            "click .js-upvote": function (event) {
                // example of how you can access the id for the website in the database
                // (this is the data context for the template)
                var website_id = this._id
                    , userId = Meteor.userId()
                    , affected;
                console.log("Up voting website with id " + website_id + " by user " + userId);
                // put the code in here to add a vote to a website!
                // if was voted down add one vote and remove from downvoters and exit
                if (_.include(this.downvoters, userId)) {
                    affected = Websites.update(
                        {
                            _id: website_id
                        },
                        {
                            $pull: {
                                downvoters: userId
                            },
                            $inc: {votes: 1}
                        });
                    if (!affected) {
                        alert('You are not able to vote! You are not logged in or you already voted Up.')
                    }
                    return;
                }
                if (!_.include(this.upvoters, userId)) {
                    affected = Websites.update(
                        {
                            _id: website_id
                        },
                        {
                            $addToSet: {
                                upvoters: userId
                            },
                            $inc: {votes: 1}
                        });
                }
                else {
                    affected = false;
                }
                if (!affected) {
                    alert('You are not able to vote! You are not logged in or you already voted Up.')
                }
                return false;// prevent the button from reloading the page
            },
            "click .js-downvote": function (event) {

                // example of how you can access the id for the website in the database
                // (this is the data context for the template)
                var website_id = this._id
                    , userId = Meteor.userId();
                console.log("Down voting website with id " + website_id);
                // put the code in here to remove a vote from a website!
                // if was voted up remove one vote and from upvoters and exit
                if (_.include(this.upvoters, userId)) {
                    var affected = Websites.update(
                        {
                            _id: website_id
                        },
                        {
                            $pull: {
                                upvoters: userId
                            },
                            $inc: {votes: -1}
                        });
                    if (!affected) {
                        alert('You are not able to vote! You are not logged in or you already voted Up.')
                    }
                    return false;
                }
                // if no vote add to downvoters
                if (!_.include(this.downvoters, userId)) {
                    var affected = Websites.update(
                        {
                            _id: website_id
                        },
                        {
                            $addToSet: {
                                downvoters: userId
                            },
                            $inc: {votes: -1}
                        });
                }
                else {
                    affected = false;
                }
                if (!affected) {
                    alert('You are not able to vote! You are not logged in or you already voted down.')
                }
                return false;// prevent the button from reloading the page
            }

        }
    )

    Template.website_form.events({
        "click .js-toggle-website-form": function (event) {
            $("#website_form").toggle('slow');
        },
        'change #url': function (event) {
            var url = event.currentTarget.value;
            var RegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
            var validUrl = false;
            if (RegExp.test(url)) {
                validUrl = true;
                extractMeta(url, function (err, res) {
                    console.log(res);
                    if (!$('#title').val() && res.title) {
                        $('#title').val(res.title);
                    }
                    ;
                    if (!$('#description').val() && res.description) {
                        $('#description').val(res.description);
                    }
                    ;
                });
            }
            Session.set('isUrl', validUrl);
        },
        'change #title': function (event) {
            var title = event.currentTarget.value;
            Session.set('isTitle', title.length > 0);
        },
        'change #description': function (event) {
            var description = event.currentTarget.value;
            Session.set('isDescription', description.length > 0);
        },
        "submit .js-save-website-form": function (event) {

            // here is an example of how to get the url out of the form:
            var url = event.target.url.value;
            var title = event.target.title.value;
            var description = event.target.description.value;
            console.log("The url they entered is: " + url);

            if (url.length && description.length && title.length) {
                //  put your website saving code in here!
                Websites.insert({
                    title: title,
                    url: url,
                    description: description,
                    createdOn: new Date(),
                    votes: 0,
                    upvoters: [],
                    downvoters: [],
                    comments: []
                });
                $("#website_form").toggle('slow');
            }
            else {
                alert("You need to have a URL a Title and a description before submit!")
            }
            return false;// stop the form submit from reloading the page

        }
    });
}

if (Meteor.isServer) {
    // start up function that creates entries in the Websites databases.
    Meteor.startup(function () {
        // code to run on server at startup
        if (!Websites.findOne()) {
            console.log("No websites yet. Creating starter data.");
            Websites.insert({
                title: "Goldsmiths Computing Department",
                url: "http://www.gold.ac.uk/computing/",
                description: "This is where this course was developed.",
                createdOn: new Date(),
                votes: 0,
                upvoters: [],
                downvoters: [],
                comments: []
            });
            Websites.insert({
                title: "University of London",
                url: "http://www.londoninternational.ac.uk/courses/undergraduate/goldsmiths/bsc-creative-computing-bsc-diploma-work-entry-route",
                description: "University of London International Programme.",
                createdOn: new Date(),
                votes: 0,
                upvoters: [],
                downvoters: [],
                comments: []
            });
            Websites.insert({
                title: "Coursera",
                url: "http://www.coursera.org",
                description: "Universal access to the world’s best education.",
                createdOn: new Date(),
                votes: 0,
                upvoters: [],
                downvoters: [],
                comments: []
            });
            Websites.insert({
                title: "Google",
                url: "http://www.google.com",
                description: "Popular search engine.",
                createdOn: new Date(),
                votes: 0,
                upvoters: [],
                downvoters: [],
                comments: []
            });
        }
    });
    Meteor.methods({
        "metaGetter": function (url) {
            var result = HTTP.call('GET', url, {headers: {'content-range': "bytes 0-600"}});
            console.log(result);
        }
    });
}
