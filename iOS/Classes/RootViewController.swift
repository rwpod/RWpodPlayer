//
//  RootViewController.swift
//  RWpodPlayer
//
//  Created by Alexey Vasiliev on 7/22/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

import UIKit

class RootViewController: UIViewController {
  
  override func canBecomeFirstResponder() -> Bool {
    return true
  }
  
  override func viewDidAppear(animated: Bool) {
    super.viewDidAppear(animated)
    self.becomeFirstResponder()
    UIApplication.sharedApplication().beginReceivingRemoteControlEvents()
  }
  
  override func viewWillDisappear(animated: Bool) {
    super.viewWillDisappear(animated)
    self.resignFirstResponder()
    UIApplication.sharedApplication().endReceivingRemoteControlEvents()
  }
}