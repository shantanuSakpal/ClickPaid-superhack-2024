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
        uint256 timeStamp = block.timestamp;

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs,
            timeStamp
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
        uint256 timeStamp = block.timestamp;

        vm.prank(user1);
        vm.deal(user1, 0.5 ether);
        vm.expectRevert("Bounty amount must match the sent value");
        thumbnailVoting.createPost{value: 0.5 ether}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs,
            timeStamp
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
        uint256 timeStamp = block.timestamp;

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs,
            timeStamp
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
        uint256 timeStamp = block.timestamp;

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs,
            timeStamp
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
        uint256 timeStamp = block.timestamp;

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs,
            timeStamp
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
        uint256 timeStamp = block.timestamp;

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs,
            timeStamp
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
        uint256 timeStamp = block.timestamp;

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs,
            timeStamp
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
        uint256 timeStamp = block.timestamp;

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs,
            timeStamp
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
        uint256 timeStamp = block.timestamp;

        vm.prank(user1);
        vm.deal(user1, 1 ether);
        thumbnailVoting.createPost{value: bounty}(
            postID,
            bounty,
            numVoters,
            userID,
            optionIDs,
            timeStamp
        );

        string[] memory posts = thumbnailVoting.getUserPosts(userID);
        assertEq(posts.length, 1);
        assertEq(posts[0], postID);
    }

    // New test for sorting and selecting posts
    function testSortAndSelectPosts() public {
        // Create multiple posts with different bounties and timestamps
        createTestPost("post1", 1 ether, 5, "user1", block.timestamp);
        vm.warp(block.timestamp + 1 days);
        createTestPost("post2", 2 ether, 5, "user2", block.timestamp);
        vm.warp(block.timestamp + 1 days);
        createTestPost("post3", 0.5 ether, 5, "user3", block.timestamp);
        vm.warp(block.timestamp + 1 days);
        createTestPost("post4", 3 ether, 5, "user4", block.timestamp);

        // Get sorted post IDs
        string[] memory sortedPostIds = thumbnailVoting.getSortedPostIds();

        // Check if we got the correct number of posts (should be 4 in this case)
        assertEq(sortedPostIds.length, 4);

        // The first post should be "post4" as it has the highest bounty and is relatively recent
        assertEq(sortedPostIds[0], "post4");

        // The second post should be "post2" as it has the second highest bounty
        assertEq(sortedPostIds[1], "post2");
    }

    function testSortAndSelectPostsWithMoreThan20Posts() public {
        // Create 25 posts
        for (uint i = 0; i < 25; i++) {
            string memory postId = string(
                abi.encodePacked("post", uint2str(i))
            );
            uint256 bounty = (i + 1) * 0.1 ether;
            createTestPost(
                postId,
                bounty,
                5,
                string(abi.encodePacked("user", uint2str(i))),
                block.timestamp
            );
            vm.warp(block.timestamp + 1 hours);
        }

        // Get sorted post IDs
        string[] memory sortedPostIds = thumbnailVoting.getSortedPostIds();

        // Check if we got exactly 20 posts
        assertEq(sortedPostIds.length, 20);

        // The first post should be "post24" as it has the highest bounty and is the most recent
        assertEq(sortedPostIds[0], "post24");
    }

    // Helper function to create a test post
    function createTestPost(
        string memory postId,
        uint256 bounty,
        uint256 numVoters,
        string memory userId,
        uint256 timestamp
    ) private {
        string[] memory optionIDs = new string[](2);
        optionIDs[0] = "option1";
        optionIDs[1] = "option2";

        vm.prank(user1);
        vm.deal(user1, bounty);
        thumbnailVoting.createPost{value: bounty}(
            postId,
            bounty,
            numVoters,
            userId,
            optionIDs,
            timestamp
        );
    }

    // Helper function to convert uint to string
    function uint2str(
        uint _i
    ) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    receive() external payable {}
}
