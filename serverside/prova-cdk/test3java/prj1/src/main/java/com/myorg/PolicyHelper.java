package com.myorg;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;

import software.amazon.awscdk.services.iam.ManagedPolicy;
import software.amazon.awscdk.services.iam.Policy;
import software.amazon.awscdk.services.iam.PolicyDocument;
import software.constructs.Construct;

public class PolicyHelper {

	private static ObjectMapper mapper = new ObjectMapper();
	
	public static ManagedPolicy getBucketAccessPolicy(String bucketName, String policyName, Construct scope)  {
		try {
			if (policyName==null)
				policyName = bucketName+"_access_policy";
			
			ObjectMapper mapper = new ObjectMapper();
	        
			String template = resToString("bucketAccessPolicyTemplate.json");
			String policyJSON = template.replace("${BUCKETNAME}", bucketName);
			Map obj = mapper.readValue(policyJSON,  Map.class);
			PolicyDocument document = PolicyDocument.fromJson(obj);
			
			ManagedPolicy policy = ManagedPolicy.Builder.create(scope, policyName)
					.managedPolicyName(policyName)
					.document(document)
					.build();
			return policy;
		} 
		catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	
	public static ManagedPolicy getAssumeRolePolicy(List<String> rolesArn, String policyName, Construct scope)  {
		try {
			if (policyName==null)
				return null;
			
	        
			String template = resToString("assumeRolesPolicyTemplate.json");
			String resources = mapper.writeValueAsString(rolesArn);
			String policyJSON = template.replace("${RESOURCE}", resources);
			Map obj = mapper.readValue(policyJSON,  Map.class);
			PolicyDocument document = PolicyDocument.fromJson(obj);			
			ManagedPolicy policy = ManagedPolicy.Builder.create(scope, policyName)
					.managedPolicyName(policyName)
					.document(document)
					.build();
			return policy;
		} 
		catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	private static String resToString(String resName) {
		try {
			InputStream s = PolicyHelper.class.getResourceAsStream(resName);
			String string = IOUtils.toString(s,"UTF-8");
			return string;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

}
