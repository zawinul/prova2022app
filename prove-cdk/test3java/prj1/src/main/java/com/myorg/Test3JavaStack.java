package com.myorg;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.iam.ManagedPolicy;
import software.amazon.awscdk.services.iam.Role;
import software.amazon.awscdk.services.iam.User;
import software.amazon.awscdk.services.s3.Bucket;
import software.amazon.awscdk.services.ssm.StringParameterProps;
import software.amazon.awscdk.services.ssm.StringParameter;
import software.amazon.awscdk.services.lambda.Function;

import software.constructs.Construct;

public class Test3JavaStack extends Stack {
    final String tenants[] = {"roma", "milano", "palermo"};
	public Test3JavaStack(final Construct scope, final String id) {
        this(scope, id, null);
    }

    
    public List<Bucket> buckets = new ArrayList<Bucket>();
    public List<ManagedPolicy> tenantPolicies = new ArrayList<ManagedPolicy>();
    public List<Role> tenantRoles= new ArrayList<Role>();
    public List<String> tenantRolesARN = new ArrayList<String>();
    
    public Test3JavaStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

		String tmUser = "test3-tm-user";
		User user = User.Builder.create(this, tmUser)
				.userName(tmUser)
				.build();

        for(String tenant: tenants) {
			String bucketName = "test4-tenant-"+tenant;
			Bucket bucket = Bucket.Builder.create(this, bucketName)
					.bucketName(bucketName)
					.build();
			buckets.add(bucket);
			ManagedPolicy accessPolicy = PolicyHelper.getBucketAccessPolicy(bucketName, bucketName+"-access-policy", this);
			tenantPolicies.add(accessPolicy);

			String roleName = bucketName+"-manager-role";
			Role r = Role.Builder.create(this,  roleName)
					.roleName(roleName)
					.assumedBy(user)
					.managedPolicies(Arrays.asList(accessPolicy))
					.build();
			tenantRoles.add(r);
			tenantRolesARN.add(r.getRoleArn());
        }
        
		ManagedPolicy assumeRolesPolicy = PolicyHelper.getAssumeRolePolicy(tenantRolesARN, "test3-assume-role-policy", this);
		//user.addManagedPolicy(assumeRolesPolicy);
		
		Function f = Function.Builder.create(this,  "aaa")
				.
				.build();
		
    }
}
