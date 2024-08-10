// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/ThumbnailVoting.sol";

contract ThumbnailVotingTest is Test {
    ThumbnailVoting private thumbnailVoting;
    address private owner;
    address private user1;
    address private user2;

    function setUp() public {
        thumbnailVoting = new ThumbnailVoting();
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
    }

    function testCreatePost() public {
        string memory postID = "post1";
        uint256 bounty = 1 ether;
        uint256 numVoters = 5;
        string memory userID = "user1";
        string[] memory optionIDs = new string[](2);
        optionIDs[0] = "option1";
        optionIDs[1] = "option2";

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs
        );

        (
            string memory retPostID,
            address creator,
            uint256 retBounty,
            uint256 retNumVoters,
            uint256 totalVotesCast,

        ) = thumbnailVoting.getPostDetails(postID);

        assertEq(retPostID, postID);
        assertEq(creator, user1);
        assertEq(retBounty, bounty);
        assertEq(retNumVoters, numVoters);
        assertEq(totalVotesCast, 0);
    }

    function testCreatePostInsufficientBounty() public {
        string memory postID = "post1";
        uint256 bounty = 1 ether;
        uint256 numVoters = 5;
        string memory userID = "user1";
        string[] memory optionIDs = new string[](2);
        optionIDs[0] = "option1";
        optionIDs[1] = "option2";

        vm.prank(user1);
        vm.deal(user1, 0.5 ether);
        vm.expectRevert("Bounty amount must match the sent value");
        thumbnailVoting.createPost{value: 0.5 ether}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs
        );
    }

    function testVote() public {
        string memory postID = "post1";
        uint256 bounty = 1 ether;
        uint256 numVoters = 5;
        string memory userID = "user1";
        string[] memory optionIDs = new string[](2);
        optionIDs[0] = "option1";
        optionIDs[1] = "option2";

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs
        );

        string memory voterID = "voter1";
        thumbnailVoting.setUserID(voterID);
        thumbnailVoting.vote(postID, voterID, "option1");

        uint256[] memory votes = thumbnailVoting.getOptionVotes(
            postID,
            optionIDs
        );
        assertEq(votes[0], 1);
        assertEq(votes[1], 0);
    }

    function testVoteTwice() public {
        string memory postID = "post1";
        uint256 bounty = 1 ether;
        uint256 numVoters = 5;
        string memory userID = "user1";
        string[] memory optionIDs = new string[](2);
        optionIDs[0] = "option1";
        optionIDs[1] = "option2";

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs
        );

        string memory voterID = "voter1";
        thumbnailVoting.setUserID(voterID);
        thumbnailVoting.vote(postID, voterID, "option1");

        vm.expectRevert("User has already voted");
        thumbnailVoting.vote(postID, voterID, "option2");
    }

    function testVoteExceedMaxVoters() public {
        string memory postID = "post1";
        uint256 bounty = 1 ether;
        uint256 numVoters = 2;
        string memory userID = "user1";
        string[] memory optionIDs = new string[](2);
        optionIDs[0] = "option1";
        optionIDs[1] = "option2";

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs
        );

        thumbnailVoting.vote(postID, "voter1", "option1");
        thumbnailVoting.vote(postID, "voter2", "option2");

        vm.expectRevert("Maximum number of voters reached");
        thumbnailVoting.vote(postID, "voter3", "option1");
    }

    function testWithdraw() public {
        string memory postID = "post1";
        uint256 bounty = 1 ether;
        uint256 numVoters = 1;
        string memory userID = "user1";
        string[] memory optionIDs = new string[](2);
        optionIDs[0] = "option1";
        optionIDs[1] = "option2";

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs
        );

        vm.prank(user1);
        thumbnailVoting.setUserID(userID);

        vm.prank(user1);
        thumbnailVoting.vote(postID, userID, "option1");

        // Check the user's balance in the contract
        uint256 userBalance = thumbnailVoting.fetchUserBalance(userID);
        console.log("User balance in contract:", userBalance);

        // Check the contract's balance
        uint256 contractBalance = address(thumbnailVoting).balance;
        console.log("Contract balance:", contractBalance);

        uint256 initialBalance = user1.balance;

        vm.prank(user1);
        thumbnailVoting.withdraw(userID, userBalance, payable(user1));

        uint256 finalBalance = user1.balance;

        assertEq(finalBalance - initialBalance, userBalance);
    }

    function testWithdrawInsufficientBalance() public {
        string memory userID = "user1";
        vm.expectRevert("Insufficient balance");
        thumbnailVoting.withdraw(userID, 1 ether, payable(user1));
    }

    function testFetchUserBalance() public {
        string memory postID = "post1";
        uint256 bounty = 1 ether;
        uint256 numVoters = 1;
        string memory userID = "user1";
        string[] memory optionIDs = new string[](2);
        optionIDs[0] = "option1";
        optionIDs[1] = "option2";

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs
        );

        thumbnailVoting.setUserID(userID);
        thumbnailVoting.vote(postID, userID, "option1");

        uint256 balance = thumbnailVoting.fetchUserBalance(userID);
        assertEq(balance, 1 ether);
    }

    function testGetUserDetails() public {
        string memory postID = "post1";
        uint256 bounty = 1 ether;
        uint256 numVoters = 1;
        string memory userID = "user1";
        string[] memory optionIDs = new string[](2);
        optionIDs[0] = "option1";
        optionIDs[1] = "option2";

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs
        );

        thumbnailVoting.setUserID(userID);
        (
            string[] memory posts,
            uint256 balance,
            address userAddress
        ) = thumbnailVoting.getUserDetails(userID);

        assertEq(posts.length, 1);
        assertEq(posts[0], postID);
        assertEq(balance, 0);
        assertEq(userAddress, address(this));
    }

    function testGetUserPosts() public {
        string memory postID = "post1";
        uint256 bounty = 1 ether;
        uint256 numVoters = 1;
        string memory userID = "user1";
        string[] memory optionIDs = new string[](2);
        optionIDs[0] = "option1";
        optionIDs[1] = "option2";

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs
        );

        string[] memory posts = thumbnailVoting.getUserPosts(userID);
        assertEq(posts.length, 1);
        assertEq(posts[0], postID);
    }

    receive() external payable {}
}
