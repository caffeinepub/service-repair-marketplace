import List "mo:core/List";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import UserApproval "user-approval/approval";

actor {
  include MixinStorage();

  // User Management Setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller) : ();
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  type SRMRole = {
    #admin;
    #institution;
    #serviceProvider;
  };

  type UserID = Principal;

  // User Info
  type UserInfo = {
    principal : Principal;
    name : Text;
    role : SRMRole;
    phone : Text;
    experience : Text;
    organization : Text; // For Institutions
    skills : Text; // For providers, comma separated
    isVerified : Bool;
    createdAt : Time.Time;
  };

  let users = Map.empty<UserID, UserInfo>();

  module UserInfo {
    public func compare(info1 : UserInfo, info2 : UserInfo) : Order.Order {
      Text.compare(info1.name, info2.name);
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserInfo {
    users.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserInfo) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  public query ({ caller }) func getAllUsers() : async [UserInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    users.values().toArray().sort();
  };

  public shared ({ caller }) func verifyProvider(providerId : UserID) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can verify providers");
    };
    let updatedUserList : List.List<UserInfo> = List.empty();
    for (user in users.values()) {
      if (user.principal == providerId) {
        updatedUserList.add({
          user with
          isVerified = true;
        });
      } else {
        updatedUserList.add(user);
      };
    };
    users.clear();
    let addedUsers = updatedUserList.values();
    for (user in addedUsers) {
      users.add(user.principal, user);
    };
  };

  public query ({ caller }) func getUnverifiedProviders() : async [UserInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let allUserList : List.List<UserInfo> = List.empty();
    for (user in users.values()) {
      allUserList.add(user);
    };
    let filteredList : List.List<UserInfo> = List.empty();
    for (user in allUserList.values()) {
      if (user.role == #serviceProvider and not user.isVerified) {
        filteredList.add(user);
      };
    };
    filteredList.toArray();
  };

  public query ({ caller }) func exists() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check existence");
    };
    users.containsKey(caller);
  };

  public query ({ caller }) func getProviders() : async [UserInfo] {
    users.values().toArray().sort().filter(func(info) { info.role == #serviceProvider });
  };

  public query ({ caller }) func getInstitutions() : async [UserInfo] {
    users.values().toArray().sort().filter(func(info) { info.role == #institution });
  };

  public query ({ caller }) func getUserById(principal : UserID) : async ?UserInfo {
    users.get(principal);
  };

  public shared ({ caller }) func updateUser(newUserInfo : UserInfo) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    if (not users.containsKey(caller)) {
      Runtime.trap("User does not exist");
    };
    // Ensure user can only update their own profile
    if (newUserInfo.principal != caller) {
      Runtime.trap("Unauthorized: Can only update your own profile");
    };
    users.add(caller, newUserInfo);
  };

  public shared ({ caller }) func addUser(newUserInfo : UserInfo) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    if (users.containsKey(caller)) { Runtime.trap("User already exists") };
    // Ensure user can only create their own profile
    if (newUserInfo.principal != caller) {
      Runtime.trap("Unauthorized: Can only create your own profile");
    };
    users.add(caller, newUserInfo);
  };

  // Job and Bid Setup

  type JobID = Nat;
  type BidID = Nat;

  type JobStatus = {
    #posted;
    #bidding;
    #assigned;
    #inProgress;
    #completed;
    #reviewed;
    #cancelled;
    #disputed;
  };

  type JobInfo = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text; // Category strings like "Electrical", "Plumbing", etc.
    budget : Float;
    assignedTo : ?UserID; // Service provider assigned to the job, if any.
    images : [Storage.ExternalBlob]; // Array of external blob references for image files
    deadline : Time.Time;
    location : Text;
    postedBy : UserID; // Principal of the institution that posted the job
    status : JobStatus;
    createdAt : Time.Time;
  };

  let jobs = Map.empty<JobID, JobInfo>();

  module JobInfo {
    public func compare(job1 : JobInfo, job2 : JobInfo) : Order.Order {
      Nat.compare(job1.id, job2.id);
    };
  };

  var id = 0;

  public shared ({ caller }) func saveJob(jobInfo : JobInfo) : async JobID {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save jobs");
    };
    // Verify caller is an institution
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?user) {
        if (user.role != #institution and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only institutions can create jobs");
        };
      };
    };
    // Ensure postedBy matches caller
    if (jobInfo.postedBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only create jobs for yourself");
    };
    id += 1;
    jobs.add(id, { jobInfo with id });
    id;
  };

  public shared ({ caller }) func updateJob(jobId : Nat, newJobInfo : JobInfo) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update jobs");
    };
    switch (jobs.get(jobId)) {
      case (null) { Runtime.trap("Job does not exist") };
      case (?jobInfo) {
        // Only the institution that posted the job or admin can update it
        if (caller != jobInfo.postedBy and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update jobs you have posted");
        };
        // Verify caller is an institution
        switch (users.get(caller)) {
          case (null) { 
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("User profile not found");
            };
          };
          case (?user) {
            if (user.role != #institution and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only institutions can update jobs");
            };
          };
        };
        jobs.add(jobId, newJobInfo);
      };
    };
  };

  public query ({ caller }) func getJob(jobId : Nat) : async ?JobInfo {
    jobs.get(jobId);
  };

  public query ({ caller }) func getAllJobs() : async [JobInfo] {
    jobs.values().toArray().sort();
  };

  public query func getJobsByInstitution(institutionId : Text) : async [JobInfo] {
    jobs.values().toArray().sort().filter(func(info) { info.postedBy.toText() == institutionId });
  };

  // Bid Logic Functions
  type BidStatus = {
    #pending;
    #accepted;
    #rejected;
  };

  type BidInfo = {
    id : BidID;
    jobId : JobID;
    userId : UserID;
    bidAmount : Float;
    message : Text;
    status : BidStatus;
    createdAt : Time.Time;
  };

  let bids = Map.empty<BidID, BidInfo>();

  module BidInfo {
    public func compare(bid1 : BidInfo, bid2 : BidInfo) : Order.Order {
      Nat.compare(bid1.id, bid2.id);
    };
  };

  var bidId = 0;

  public shared ({ caller }) func submitBid(bidInfo : BidInfo) : async BidID {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit a bid");
    };
    // Verify caller is a service provider
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?user) {
        if (user.role != #serviceProvider) {
          Runtime.trap("Unauthorized: Only service providers can submit bids");
        };
        if (not user.isVerified) {
          Runtime.trap("Unauthorized: Only verified service providers can submit bids");
        };
      };
    };
    // Ensure userId matches caller
    if (bidInfo.userId != caller) {
      Runtime.trap("Unauthorized: Can only submit bids for yourself");
    };
    // Verify job exists and is in appropriate status
    switch (jobs.get(bidInfo.jobId)) {
      case (null) { Runtime.trap("Job does not exist") };
      case (?job) {
        if (job.status != #posted and job.status != #bidding) {
          Runtime.trap("Job is not accepting bids");
        };
      };
    };
    bidId += 1;
    bids.add(bidId, { bidInfo with id = bidId });
    bidId;
  };

  public shared ({ caller }) func updateBid(bidId : BidID, newBidInfo : BidInfo) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update bids");
    };
    switch (bids.get(bidId)) {
      case (null) { Runtime.trap("Bid does not exist") };
      case (?bidInfo) {
        if (bidInfo.status != #pending) {
          Runtime.trap("Cannot update bid. Bid is no longer pending");
        };
        // Only the provider who submitted the bid can update it
        if (caller != bidInfo.userId) {
          Runtime.trap("Unauthorized: Can only update your own bids");
        };
        // Verify caller is still a service provider
        switch (users.get(caller)) {
          case (null) { Runtime.trap("User profile not found") };
          case (?user) {
            if (user.role != #serviceProvider) {
              Runtime.trap("Unauthorized: Only service providers can update bids");
            };
          };
        };
        bids.add(bidId, newBidInfo);
      };
    };
  };

  public shared ({ caller }) func submitJob(jobInfo : JobInfo) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can submit jobs");
    };
    // Verify caller is an institution
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?user) {
        if (user.role != #institution and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only institutions can submit jobs");
        };
      };
    };
    // Ensure postedBy matches caller
    if (jobInfo.postedBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only submit jobs for yourself");
    };
    jobs.add(jobInfo.id, jobInfo);
  };

  public query ({ caller }) func getBidsForJob(jobId : JobID) : async [BidInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view bids");
    };
    // Only the institution that posted the job or admin can view all bids
    switch (jobs.get(jobId)) {
      case (null) { Runtime.trap("Job does not exist") };
      case (?job) {
        if (caller != job.postedBy and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view bids for jobs you posted");
        };
      };
    };
    bids.values().toArray().sort().filter(func(info) { info.jobId == jobId });
  };

  public query ({ caller }) func getBidsByProvider() : async [BidInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view bids");
    };
    bids.values().toArray().sort().filter(func(info) { info.userId == caller });
  };

  public shared ({ caller }) func acceptBid(bidId : Nat, jobId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can accept bids");
    };
    // Verify the job exists and caller is the institution that posted it
    switch (jobs.get(jobId)) {
      case (null) { Runtime.trap("Job does not exist") };
      case (?job) {
        if (caller != job.postedBy and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only accept bids for jobs you posted");
        };
        // Verify caller is an institution
        switch (users.get(caller)) {
          case (null) { 
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("User profile not found");
            };
          };
          case (?user) {
            if (user.role != #institution and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only institutions can accept bids");
            };
          };
        };
      };
    };
    // Accept the chosen bid for the job
    switch (bids.get(bidId)) {
      case (null) {
        Runtime.trap("Bid does not exist");
      };
      case (?bid) {
        if (bid.jobId != jobId) {
          Runtime.trap("Bid does not belong to this job");
        };
        if (bid.status != #pending) {
          Runtime.trap("Bid is not pending");
        };
        // Update the status of the bid
        bids.add(bidId, { bid with status = #accepted });

        // Reject all other bids for the job
        for (otherBid in bids.values()) {
          if (otherBid.jobId == jobId and otherBid.id != bidId and otherBid.status == #pending) {
            bids.add(otherBid.id, { otherBid with status = #rejected });
          };
        };
      };
    };
  };

  public shared ({ caller }) func rejectBid(bidId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can reject bids");
    };
    switch (bids.get(bidId)) {
      case (null) { Runtime.trap("Bid does not exist") };
      case (?bidInfo) {
        // Verify the job exists and caller is the institution that posted it
        switch (jobs.get(bidInfo.jobId)) {
          case (null) { Runtime.trap("Job does not exist") };
          case (?job) {
            if (caller != job.postedBy and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only reject bids for jobs you posted");
            };
            // Verify caller is an institution
            switch (users.get(caller)) {
              case (null) { 
                if (not AccessControl.isAdmin(accessControlState, caller)) {
                  Runtime.trap("User profile not found");
                };
              };
              case (?user) {
                if (user.role != #institution and not AccessControl.isAdmin(accessControlState, caller)) {
                  Runtime.trap("Unauthorized: Only institutions can reject bids");
                };
              };
            };
          };
        };
        if (bidInfo.status != #pending) {
          Runtime.trap("Bid is not pending");
        };
        bids.add(bidId, { bidInfo with status = #rejected });
      };
    };
  };

  public query ({ caller }) func getBidById(bidId : BidID) : async ?BidInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view bids");
    };
    switch (bids.get(bidId)) {
      case (null) { null };
      case (?bid) {
        // Only the provider who submitted the bid, the institution that posted the job, or admin can view
        switch (jobs.get(bid.jobId)) {
          case (null) { null };
          case (?job) {
            if (caller == bid.userId or caller == job.postedBy or AccessControl.isAdmin(accessControlState, caller)) {
              ?bid;
            } else {
              Runtime.trap("Unauthorized: Can only view your own bids or bids for your jobs");
            };
          };
        };
      };
    };
  };

  // Review Logic Functions

  var reviewId = 0;
  type ReviewID = Nat;

  type ReviewInfo = {
    id : ReviewID;
    jobId : JobID;
    institutionId : UserID;
    serviceProviderId : UserID;
    feedback : Text;
    rating : Nat;
    createdAt : Time.Time;
  };

  let reviews = Map.empty<ReviewID, ReviewInfo>();

  module ReviewInfo {
    public func compare(review1 : ReviewInfo, review2 : ReviewInfo) : Order.Order {
      Text.compare(review1.feedback, review2.feedback);
    };
  };

  public shared ({ caller }) func submitReview(reviewInfo : ReviewInfo) : async ReviewID {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit reviews");
    };
    // Verify caller is an institution
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?user) {
        if (user.role != #institution and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only institutions can submit reviews");
        };
      };
    };
    // Verify the job exists and caller is the institution that posted it
    switch (jobs.get(reviewInfo.jobId)) {
      case (null) { Runtime.trap("Job does not exist") };
      case (?job) {
        if (caller != job.postedBy and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only review jobs you posted");
        };
        if (job.status != #completed) {
          Runtime.trap("Can only review completed jobs");
        };
        // Verify the service provider matches the assigned provider
        switch (job.assignedTo) {
          case (null) { Runtime.trap("Job has no assigned provider") };
          case (?assignedProvider) {
            if (assignedProvider != reviewInfo.serviceProviderId) {
              Runtime.trap("Service provider does not match assigned provider");
            };
          };
        };
      };
    };
    // Ensure institutionId matches caller
    if (reviewInfo.institutionId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only submit reviews for yourself");
    };
    // Validate rating is between 1 and 5
    if (reviewInfo.rating < 1 or reviewInfo.rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };
    reviewId += 1;
    reviews.add(reviewId, { reviewInfo with id = reviewId });
    reviewId;
  };

  public query ({ caller }) func getReviewsByProvider(providerId : UserID) : async [ReviewInfo] {
    reviews.values().toArray().sort().filter(func(info) { info.serviceProviderId == providerId });
  };

  public query ({ caller }) func getReviewsByInstitution() : async [ReviewInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view reviews");
    };
    reviews.values().toArray().sort().filter(func(info) { info.institutionId == caller });
  };

  public query ({ caller }) func getReviewsByJob(jobId : JobID) : async [ReviewInfo] {
    reviews.values().toArray().sort().filter(func(info) { info.jobId == jobId });
  };

  // Analytics
  type Analytics = {
    totalUsers : Nat;
    totalJobs : Nat;
    totalBids : Nat;
    totalReviews : Nat;
    avgRating : Float;
  };

  public query ({ caller }) func getAnalytics() : async Analytics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access analytics");
    };
    let totalUsers = users.size();
    let totalJobs = jobs.size();
    let totalBids = bids.size();
    let totalReviews = reviews.size();

    var sum = 0;
    for (review in reviews.values()) {
      sum += review.rating;
    };

    var avgRating : Float = 0;
    if (totalReviews > 0) {
      avgRating := sum.toFloat() / totalReviews.toFloat();
    };
    {
      totalUsers;
      totalJobs;
      totalBids;
      totalReviews;
      avgRating;
    };
  };

  // Search and Filter Functionality - Generalized Search Filter Helper
  func filterBySearchTerm(searchTerm : Text, field : Text) : Bool {
    if (searchTerm.size() == 0) {
      true;
    } else {
      field.contains(#text searchTerm);
    };
  };

  public query ({ caller }) func searchJobsByTitle(searchTerm : Text) : async [JobInfo] {
    let results : List.List<JobInfo> = List.empty();
    for (job in jobs.values()) {
      if (filterBySearchTerm(searchTerm, job.title)) {
        results.add(job);
      };
    };
    results.toArray();
  };

  public query ({ caller }) func searchJobsByLocation(searchTerm : Text) : async [JobInfo] {
    let results : List.List<JobInfo> = List.empty();
    for (job in jobs.values()) {
      if (filterBySearchTerm(searchTerm, job.location)) {
        results.add(job);
      };
    };
    results.toArray();
  };

  public query ({ caller }) func filterJobsByCategory(category : Text) : async [JobInfo] {
    let results : List.List<JobInfo> = List.empty();
    for (job in jobs.values()) {
      if (category.size() == 0 or job.category == category) {
        results.add(job);
      };
    };
    results.toArray();
  };

  public query ({ caller }) func filterJobsByStatus(status : JobStatus) : async [JobInfo] {
    let results : List.List<JobInfo> = List.empty();
    for (job in jobs.values()) {
      if (job.status == status) {
        results.add(job);
      };
    };
    results.toArray();
  };
};
