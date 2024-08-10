/**
 *Submitted for verification at sepolia-optimm.etherscan.io on 2024-08-06
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ThumbnailVoting {

    struct Post {
        address creator;
        uint256 bounty;
        uint256 numVoters;
        mapping(string => uint256) optionVotes;  // Track votes per optionID
        uint256 totalVotesCast;  // Total votes cast
        string[] peopleWhoVoted;  // UserIDs of voters
    }

    mapping(string => Post) public posts;  // PostID => Post
    mapping(string => uint256) public tokenBalance;  // UserID => TokenBalance
    mapping(string => address) public userAddresses;  // UserID => UserAddress

    uint256 public conversionRate = 100;
    uint256 public ethToUsdRate = 2000;

    event PostCreated(string postId, address creator, uint256 bounty, uint256 numVoters, string[] optionIDs);
    event Voted(string postId, string userId, string optionID, uint256 reward);
    event Withdrawn(string userId, uint256 ethAmount);

    // Deposit ETH and convert to tokens for a user
    function deposit(string memory userId, uint256 ethAmount) external payable {
        require(msg.value == ethAmount, "ETH amount mismatch");

        uint256 usdAmount = (ethAmount * ethToUsdRate) / 1 ether; // Convert Wei to USD
        uint256 tokenAmount = usdAmount * conversionRate; // Convert USD to Tokens

        // Update token balance for the user
        tokenBalance[userId] += tokenAmount;
    }

    // Create a post with options and initialize vote counts
    function createPost(string memory postId, uint256 bounty, uint256 numVoters, string memory userId, string[] memory optionIDs) external {
        require(bounty > 0, "Bounty must be greater than zero");
        require(numVoters > 0, "Number of voters must be greater than zero");
        require(tokenBalance[userId] >= bounty, "Insufficient balance to create post");

        Post storage newPost = posts[postId];
        newPost.creator = userAddresses[userId];
        newPost.bounty = bounty;
        newPost.numVoters = numVoters;

        // Initialize optionVotes
        for (uint i = 0; i < optionIDs.length; i++) {
            newPost.optionVotes[optionIDs[i]] = 0;
        }

        // Update user balance
        tokenBalance[userId] -= bounty;

        emit PostCreated(postId, userAddresses[userId], bounty, numVoters, optionIDs);
    }

    // Record a vote for an option and update user's token balance
    function vote(string memory postId, string memory userId, string memory optionID) external {
        Post storage post = posts[postId];

        // Add userID to the list of people who voted
        post.peopleWhoVoted.push(userId);

        // Add userID and address if not already present
        if (userAddresses[userId] == address(0)) {
            userAddresses[userId] = msg.sender;
        }

        // Update vote count for the selected optionID
        post.optionVotes[optionID]++;
        post.totalVotesCast++;

        // Update user's token balance
        uint256 reward = post.bounty / post.numVoters;
        tokenBalance[userId] += reward;

        emit Voted(postId, userId, optionID, reward);
    }

    // Withdraw tokens and convert them to ETH
    function withdraw(string memory userId, uint256 tokenAmount) external {
        require(userAddresses[userId] == msg.sender, "Only the user can withdraw");
        uint256 userTokenBalance = tokenBalance[userId];
        require(userTokenBalance >= tokenAmount, "Insufficient token balance");

        // Convert tokens to USD
        uint256 usdAmount = tokenAmount / conversionRate;
        // Convert USD to Wei
        uint256 ethAmount = (usdAmount * 1 ether) / ethToUsdRate;

        require(address(this).balance >= ethAmount, "Insufficient contract balance");

        // Deduct tokens from the user's balance
        tokenBalance[userId] -= tokenAmount;

        // Transfer ETH to the user's address
        payable(userAddresses[userId]).transfer(ethAmount);

        emit Withdrawn(userId, ethAmount);
    }

    // Getter function to retrieve post details
    function getPost(string memory postId) external view returns (address creator, uint256 bounty, uint256 numVoters, uint256 totalVotesCast, string[] memory peopleWhoVoted, string[] memory optionIDs, uint256[] memory optionVotes) {
        Post storage post = posts[postId];
        uint256 optionCount = 0;

        // Calculate the number of options
        for (uint i = 0; i < post.peopleWhoVoted.length; i++) {
            string memory optionID = post.peopleWhoVoted[i];
            if (post.optionVotes[optionID] > 0) {
                optionCount++;
            }
        }

        // Create arrays for options and votes
        string[] memory options = new string[](optionCount);
        uint256[] memory votes = new uint256[](optionCount);
        uint256 index = 0;

        for (uint i = 0; i < post.peopleWhoVoted.length; i++) {
            string memory optionID = post.peopleWhoVoted[i];
            if (post.optionVotes[optionID] > 0) {
                options[index] = optionID;
                votes[index] = post.optionVotes[optionID];
                index++;
            }
        }

        return (post.creator, post.bounty, post.numVoters, post.totalVotesCast, post.peopleWhoVoted, options, votes);
    }

    // Getter function to retrieve user's token balance
    function getTokenBalance(string memory userId) external view returns (uint256) {
        return tokenBalance[userId];
    }

    // Getter function to retrieve user's address
    function getUserAddress(string memory userId) external view returns (address) {
        return userAddresses[userId];
    }
}