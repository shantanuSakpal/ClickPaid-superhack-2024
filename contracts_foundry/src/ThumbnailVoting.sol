// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ThumbnailVoting {
    struct Post {
        string postID; // Unique identifier for the post
        address creator; // Address of the post creator
        uint256 bounty; // Bounty amount in Wei
        uint256 numVoters; // Number of unique voters
        mapping(string => uint256) optionVotes; // Track votes per optionID
        uint256 totalVotesCast; // Total votes cast
        string[] peopleWhoVoted; // UserIDs of voters
    }

    struct User {
        string[] posts; // Array of post IDs
        uint256 balance; // Balance in Wei
        address userAddress; // User's address
    }

    mapping(string => User) public users; // Mapping from UserID to User object
    mapping(string => Post) public posts; // Mapping from PostID to Post object

    event Withdrawn(address indexed user, uint256 amount);
    event PostCreated(address indexed creator, string postID, uint256 bounty);
    event Voted(address indexed voter, string postID, string optionID);

    // Withdraw Wei from user account
    function withdraw(
        string memory _userID,
        uint256 _amount,
        address payable _to
    ) public {
        require(_amount > 0, "Must withdraw a positive amount");
        require(users[_userID].balance >= _amount, "Insufficient balance");

        // Transfer the amount to the specified address
        users[_userID].balance -= _amount; // Subtract the amount from the user's balance
        _to.transfer(_amount); // Transfer the amount to the specified address
        emit Withdrawn(_to, _amount);
    }

    // Create a new post
    function createPost(
        string memory _postID,
        uint256 _bounty, // Amount in Wei
        uint256 _numVoters,
        string memory _userID,
        string[] memory _optionIDs
    ) public payable {
        require(_bounty > 0, "Bounty must be greater than 0");
        require(
            msg.value == _bounty,
            "Bounty amount must match the sent value"
        );

        Post storage newPost = posts[_postID];
        newPost.postID = _postID;
        newPost.creator = msg.sender; // Use msg.sender directly
        newPost.bounty = _bounty;
        newPost.numVoters = _numVoters;
        newPost.totalVotesCast = 0;

        // Add the bounty amount to the user's balance

        users[_userID].posts.push(_postID);

        // Add the options to the post
        for (uint256 i = 0; i < _optionIDs.length; i++) {
            newPost.optionVotes[_optionIDs[i]] = 0; // Initialize option votes to 0
        }

        emit PostCreated(newPost.creator, _postID, _bounty);
    }

    function vote(
        string memory _postID,
        string memory _userID,
        string memory _optionID
    ) public {
        Post storage post = posts[_postID];
        User storage voter = users[_userID];

        // Check if the user has already voted
        for (uint256 i = 0; i < post.peopleWhoVoted.length; i++) {
            require(
                keccak256(abi.encodePacked(post.peopleWhoVoted[i])) !=
                    keccak256(abi.encodePacked(_userID)),
                "User has already voted"
            );
        }

        // Check if the total votes cast has reached the maximum number of voters
        require(
            post.totalVotesCast < post.numVoters,
            "Maximum number of voters reached"
        );

        // Record the vote
        post.optionVotes[_optionID]++;
        post.totalVotesCast++; // Increment the total votes cast
        post.peopleWhoVoted.push(_userID); // Add UserID to the list of voters

        // Calculate reward for the voter
        uint256 reward = post.bounty / post.numVoters;

        // Update voter's balance
        voter.balance += reward; // Increase voter's balance

        emit Voted(voter.userAddress, _postID, _optionID);
    }

    // Set the UserID for the user
    function setUserID(string memory _userID) public {
        users[_userID].userAddress = msg.sender; // Set the user's address
    }

    // Fetch user balance in Wei
    function fetchUserBalance(
        string memory _userID
    ) public view returns (uint256) {
        return users[_userID].balance; // Return balance in Wei
    }

    // Get user details
    function getUserDetails(
        string memory _userID
    ) public view returns (string[] memory, uint256, address) {
        User storage user = users[_userID];
        return (user.posts, user.balance, user.userAddress); // Return user posts, balance in Wei, and address
    }

    // Get user posts
    function getUserPosts(
        string memory _userID
    ) public view returns (string[] memory) {
        return users[_userID].posts; // Return user posts
    }

    // Get post details
    function getPostDetails(
        string memory _postID
    )
        public
        view
        returns (
            string memory postID,
            address creator,
            uint256 bounty,
            uint256 numVoters,
            uint256 totalVotesCast,
            string[] memory peopleWhoVoted
        )
    {
        Post storage post = posts[_postID];
        postID = post.postID;
        creator = post.creator;
        bounty = post.bounty;
        numVoters = post.numVoters;
        totalVotesCast = post.totalVotesCast;
        peopleWhoVoted = post.peopleWhoVoted; // Return the list of voters
    }

    // Get option votes for a post
    function getOptionVotes(
        string memory _postID,
        string[] memory _optionIDs
    ) public view returns (uint256[] memory) {
        uint256[] memory votes = new uint256[](_optionIDs.length);
        for (uint256 i = 0; i < _optionIDs.length; i++) {
            votes[i] = posts[_postID].optionVotes[_optionIDs[i]]; // Get the votes for each option
        }
        return votes; // Return the array of votes
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
