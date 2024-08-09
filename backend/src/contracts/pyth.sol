// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract ThumbnailVoting {
    IPyth pyth;

    constructor(address pythContract) {
        pyth = IPyth(pythContract);
    }

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
        uint256 userBalanceInUSD; // User's balance in USD
        address userAddress; // User's address
    }

    mapping(string => User) public users; // Mapping from UserID to User object
    mapping(string => Post) public posts; // Mapping from PostID to Post object

    event Deposited(address indexed user, uint256 amount, uint256 amountInUSD);
    event Withdrawn(address indexed user, uint256 amount);
    event PostCreated(address indexed creator, string postID, uint256 bounty);
    event Voted(address indexed voter, string postID, string optionID);

    // Deposit Wei into user account
    // Deposit Wei into user account
    // Deposit Wei into user account
    function deposit(string memory _userID, bytes[] calldata updateData)
    external
    payable
    {
        require(msg.value > 0, "Must deposit a positive amount");

        // Update the userAddress to the current msg.sender
        users[_userID].userAddress = msg.sender;

        // Add the amount to the user's balance in Wei
        users[_userID].balance += msg.value;

        // Update the price feeds using the provided priceUpdate
        uint256 fee = pyth.getUpdateFee(updateData);
        pyth.updatePriceFeeds{value: fee}(updateData);

        // Read the current price from a price feed

        bytes32 priceFeedId = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace; // ETH/USD
        PythStructs.Price memory price = pyth.getPrice(priceFeedId);

        // Convert price.price from int64 to uint256
        uint256 priceInUSD = uint256(uint64(price.price)); // Convert to uint256
        require(priceInUSD > 0, "Price must be greater than zero"); // Ensure price is valid

        // Calculate userBalanceInUSD
        users[_userID].userBalanceInUSD = (msg.value * priceInUSD) / 10**8; // Assuming 8 decimal places for the price

        emit Deposited(msg.sender, msg.value, users[_userID].userBalanceInUSD);
    }

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
    ) public {
        require(_bounty > 0, "Bounty must be greater than 0");
        require(users[_userID].balance >= _bounty, "Insufficient balance");

        Post storage newPost = posts[_postID];
        newPost.postID = _postID;
        newPost.creator = users[_userID].userAddress;
        newPost.bounty = _bounty;
        newPost.numVoters = _numVoters;
        newPost.totalVotesCast = 0;

        // Subtract the bounty amount from the user's balance
        users[_userID].balance -= _bounty;
        users[_userID].posts.push(_postID);
        // Add the options to the post
        for (uint256 i = 0; i < _optionIDs.length; i++) {
            newPost.optionVotes[_optionIDs[i]] = 0; // Initialize option votes to 0
        }

        emit PostCreated(newPost.creator, _postID, _bounty);
    }

    // Vote for an option in a post
    function vote(
        string memory _postID,
        string memory _userID,
        string memory _optionID
    ) public {
        Post storage post = posts[_postID];
        User storage voter = users[_userID];
        // Record the vote
        post.optionVotes[_optionID]++;
        post.totalVotesCast++;
        post.peopleWhoVoted.push(_userID); // Add UserID to the list of voters
        post.numVoters++; // Increment the number of unique voters

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
    function fetchUserBalance(string memory _userID)
    public
    view
    returns (uint256)
    {
        return users[_userID].balance; // Return balance in Wei
    }

    // Get user details
    function getUserDetails(string memory _userID)
    public
    view
    returns (
        string[] memory,
        uint256,
        address
    )
    {
        User storage user = users[_userID];
        return (user.posts, user.balance, user.userAddress); // Return user posts, balance in Wei, and address
    }

    // Get user posts
    function getUserPosts(string memory _userID)
    public
    view
    returns (string[] memory)
    {
        return users[_userID].posts; // Return user posts
    }

    // Get post details
    function getPostDetails(string memory _postID)
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
    function getOptionVotes(string memory _postID, string[] memory _optionIDs)
    public
    view
    returns (uint256[] memory)
    {
        uint256[] memory votes = new uint256[](_optionIDs.length);
        for (uint256 i = 0; i < _optionIDs.length; i++) {
            votes[i] = posts[_postID].optionVotes[_optionIDs[i]]; // Get the votes for each option
        }
        return votes; // Return the array of votes
    }

    // Fallback function to receive Ether
    receive() external payable {}
}